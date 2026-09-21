import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function load(path, dependencies) {
	const exports = [];
	const source = stripTypeScriptTypes(read(path))
		.replace(
			/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g,
			(_, bindings, module) => `const {${bindings.replace(/\bas\b/g, ":")}} = require(${JSON.stringify(module)});`,
		)
		.replace(/export (class|function) (\w+)/g, (_, kind, name) => {
			exports.push(name);
			return `${kind} ${name}`;
		});
	return new Function("require", "changetype", `${source}\nreturn {${exports.join(",")}};`)(
		name => {
			assert.ok(name in dependencies, `unexpected dependency ${name}`);
			return dependencies[name];
		},
		value => value,
	);
}

function harness() {
	const rows = [];
	const totals = new Map();
	const details = new Map();
	const model = kind =>
		class {
			constructor(id) {
				this.id = id;
				this.kind = kind;
			}
			save() {
				rows.push(this);
			}
		};
	const mapping = load("perps/analytics/utils/explorerEvents.ts", {
		"@graphprotocol/graph-ts": { BigInt: { zero: () => number(0), fromI32: number } },
		"../../common/BaseHandler": { Version: { v_0_8_3: 3 } },
		"../../../generated/schema": {
			QuoteFeeTotals: class {
				constructor(id) {
					this.id = id;
					this.paidOpenFee = null;
					this.paidCloseFee = null;
				}
				static load(id) {
					return totals.get(id) ?? null;
				}
				save() {
					totals.set(this.id, this);
				}
			},
			LiquidationDetail: { load: id => details.get(id) ?? null },
			WithdrawFinalization: model("finalization"),
			LiquidationStart: model("start"),
		},
	});
	const event = log => ({
		address: bytes("core"),
		transaction: { hash: { toHexString: () => "tx" } },
		logIndex: log,
		block: { timestamp: 123, number: 456 },
	});
	return { rows, totals, details, mapping, event };
}

const bytes = value => ({ toHexString: () => value, equals: other => other.toHexString() === value });
const number = value => ({
	toString: () => String(value),
	plus: other => number(BigInt(value) + BigInt(other.toString())),
	minus: other => number(BigInt(value) - BigInt(other.toString())),
	equals: other => BigInt(value) === BigInt(other.toString()),
	neg: () => number(-BigInt(value)),
});

test("quote fee totals aggregate exact amounts across partial closes and isolate shared transactions", () => {
	const { rows, totals, mapping, event } = harness();
	for (const [quoteId, log, amount, type] of [
		[1, 3, "100000000000000000001", 0],
		[2, 4, "7", 1],
		[1, 5, "9", 1],
		[1, 6, "11", 1],
	]) {
		mapping.accumulateQuoteFees({
			...event(log),
			params: { quoteId, amount: number(amount), _type: type, partyA: "a", affiliate: "affiliate" },
		});
	}
	assert.deepEqual(
		[...totals.values()].map(row => [row.id, row.quote, row.paidOpenFee?.toString() ?? null, row.paidCloseFee?.toString() ?? null]),
		[
			["1-core", "1-core", "100000000000000000001", "20"],
			["2-core", "2-core", null, "7"],
		],
	);
	assert.equal(rows.length, 0, "normal fee flow must not emit raw rows");
	mapping.accumulateQuoteFees({
		...event(7),
		address: bytes("other-core"),
		params: { quoteId: 1, amount: number(0), _type: 0, partyA: "a", affiliate: "affiliate" },
	});
	assert.equal(totals.size, 3, "same quote ID on another core must remain separate");
	assert.equal(totals.get("1-other-core").paidOpenFee.toString(), "0", "emitted zero differs from absent fee coverage");
});

test("withdraw finalizations retain exact log identity and emitted signer without request resolution", () => {
	const { rows, mapping, event } = harness();
	for (const log of [10, 12]) mapping.recordWithdrawFinalization({ ...event(log), params: { requestId: 5, user: "finalizer-not-owner" } }, null);
	assert.deepEqual(
		rows.map(row => [row.id, row.logIndex, row.requestId, row.user]),
		[
			["tx-10", 10, 5, "finalizer-not-owner"],
			["tx-12", 12, 5, "finalizer-not-owner"],
		],
	);
});

test("resolved finalization enriches its request without creating a raw row", () => {
	const { rows, mapping, event } = harness();
	const request = { user: "owner", transaction: "initiation", save() {} };
	mapping.recordWithdrawFinalization({ ...event(number(12)), params: { requestId: 5, user: "signer" } }, request);
	assert.equal(rows.length, 0);
	assert.equal(request.user, "owner");
	assert.equal(request.transaction, "initiation");
	assert.equal(request.finalizedTransaction.toHexString(), "tx");
	assert.equal(request.finalizedBy, "signer");
	assert.equal(request.finalizedLogIndex.toString(), "12");
	assert.equal(request.finalizedBalanceChange, "tx-11");
	assert.equal(request.finalizedTimestamp, 123);
	assert.equal(request.finalizedBlockNumber, 456);
});

test("withdraw resolution matches exact preceding log, not signer or ambiguous request IDs", () => {
	const source = bytes("core"),
		signer = bytes("provider"),
		transaction = bytes("tx");
	const balances = new Map(),
		requests = new Map();
	const mapping = load("perps/analytics/utils/withdrawRequest.ts", {
		"@graphprotocol/graph-ts": { BigInt: { fromI32: number }, store: {} },
		"../../../generated/schema": {
			BalanceChange: { load: id => balances.get(id) ?? null },
			WithdrawRequest: { load: id => requests.get(id) ?? null },
		},
	});
	const first = { user: bytes("owner1"), source, amount: number(10), status: "PENDING" };
	const second = { user: bytes("owner2"), source, amount: number(20), status: "PROVIDER_ACCEPTED" };
	requests.set("owner1-1-core", first);
	requests.set("owner2-1-core", second);
	requests.set("provider-1-core", { user: signer, source, amount: number(10), status: "PENDING" });
	balances.set("tx-10", { type: "WITHDRAW", source, sender: signer, account: first.user, amount: first.amount });
	balances.set("tx-12", { type: "WITHDRAW", source, sender: signer, account: second.user, amount: second.amount });
	const resolve = log => mapping.resolveWithdrawRequest(signer, number(1), source, transaction, number(log));
	assert.equal(resolve(11), first);
	assert.equal(resolve(13), second, "same signer/request ID/transaction must still select exact owner");
	assert.equal(resolve(14), null, "non-adjacent log is not proof");
	for (const change of [
		{ source: bytes("other-core") },
		{ sender: bytes("someone-else") },
		{ type: "DEPOSIT" },
		{ amount: number(999) },
		{ account: bytes("unknown") },
	]) {
		balances.set("tx-10", { type: "WITHDRAW", source, sender: signer, account: first.user, amount: first.amount, ...change });
		assert.equal(resolve(11), null);
	}
	balances.set("tx-10", { type: "WITHDRAW", source, sender: signer, account: first.user, amount: first.amount });
	for (const status of ["PENDING", "PROVIDER_ACCEPTED", "CANCEL_REQUESTED"]) {
		first.status = status;
		assert.equal(resolve(11), first);
	}
	for (const status of ["COMPLETED", "CANCELLED", "PROVIDER_REJECTED", "SUSPENDED"]) {
		first.status = status;
		assert.equal(resolve(11), null, "terminal requests must not decrement pending aggregates twice");
	}
});

test("finalization handler preserves normalized status and accounting with exact provenance", () => {
	const { mapping, rows, event } = harness();
	const request = { user: bytes("owner"), amount: number(10), status: "PENDING", save() {} };
	const accounting = [],
		removed = [];
	const handler = load("perps/analytics/handlers/symmio/WithdrawFinalizedHandler.ts", {
		"../../../common/handlers/symmio/WithdrawFinalizedHandler": {
			WithdrawFinalizedHandler: class {
				handle() {}
			},
		},
		"../../../../generated/schema": { Account: { load: () => ({ id: "owner" }) } },
		"@graphprotocol/graph-ts": { BigInt: { zero: () => number(0), fromI32: number }, Address: { fromBytes: value => value } },
		"../../../common/BaseHandler": {},
		"../../utils/latestAccountBalance": { updatePartyALatestBalance() {} },
		"../../utils/historyHelpers": { updateWithdrawHierarchyHistories: (...args) => accounting.push(args.slice(2).map(x => x.toString())) },
		"../../utils/withdrawRequest": {
			resolveWithdrawRequest: () => (request.status === "PENDING" ? request : null),
			removeWithdrawRequestFromLookup: row => removed.push(row),
		},
		"../../utils/affiliateExpressWithdrawComponents": { removeWithdrawRequestFromAffiliateExpressWithdrawComponents() {} },
		"../../utils/explorerEvents": mapping,
	});
	const log = { ...event(number(12)), params: { requestId: number(1), user: bytes("provider") } };
	new handler.WithdrawFinalizedHandler().handle(log, 5);
	assert.equal(request.status, "COMPLETED");
	assert.equal(request.finalizedBalanceChange, "tx-11");
	assert.deepEqual(accounting, [["0", "-1", "1", "-10"]]);
	assert.deepEqual(removed, [request]);
	assert.equal(rows.length, 0);
	new handler.WithdrawFinalizedHandler().handle(log, 5);
	assert.equal(accounting.length, 1, "unresolved/terminal requests must not change aggregates");
	assert.equal(rows.length, 1, "unresolved evidence remains available without guessing ownership");
});

test("every supported liquidation-start ABI is retained without synthetic state", () => {
	const { rows, mapping, event } = harness();
	for (let v = 0; v <= 6; v++) {
		const abi = JSON.parse(read(`configs/abis/symmio_0_8_${v}.json`));
		for (const definition of abi.filter(item => item.type === "event" && ["LiquidatePartyA", "DeferredLiquidatePartyA"].includes(item.name))) {
			const values = {};
			const parameters = definition.inputs.map((input, i) => {
				const value = input.type === "address" || input.type === "bytes" ? bytes(`value-${input.name}`) : String(i * 10);
				values[input.name] = value;
				return { name: input.name, value: { toAddress: () => value, toBytes: () => value, toBigInt: () => value } };
			});
			mapping.recordLiquidationStart({ ...event(rows.length), parameters }, definition.name === "DeferredLiquidatePartyA", v);
			const row = rows.at(-1);
			for (const [name, value] of Object.entries(values)) assert.equal(row[name], value, `${v}:${name}`);
			if (v < 3) assert.equal(row.liquidationId, undefined);
			assert.equal(row.deferred, definition.name === "DeferredLiquidatePartyA");
		}
	}
	assert.equal(rows.length, 11);
});

test("known liquidation starts enrich the lifecycle instead of duplicating raw events", () => {
	const { rows, details, mapping, event } = harness();
	for (const v of [3, 4, 5, 6]) {
		const abi = JSON.parse(read(`configs/abis/symmio_0_8_${v}.json`));
		for (const definition of abi.filter(item => item.type === "event" && ["LiquidatePartyA", "DeferredLiquidatePartyA"].includes(item.name))) {
			const detail = { settled: false, save() {} };
			details.set("partyA-liquidationId-core", detail);
			const parameters = definition.inputs.map(input => ({
				name: input.name,
				value: { toAddress: () => bytes(input.name), toBytes: () => bytes(input.name), toBigInt: () => number(99) },
			}));
			mapping.recordLiquidationStart({ ...event(v), parameters }, definition.name === "DeferredLiquidatePartyA", v);
			assert.equal(detail.startLogIndex, v);
			assert.equal(detail.startTimestamp, 123);
			assert.equal(detail.startBlockNumber, 456);
			assert.equal(detail.liquidationStartTransaction.toHexString(), "tx");
			assert.equal(detail.deferred, definition.name === "DeferredLiquidatePartyA");
			if (detail.deferred) assert.equal(detail.liquidationBlockNumber.toString(), "99");
		}
	}
	assert.equal(rows.length, 0);
});

test("legacy starts remain distinct even when a potentially unrelated lifecycle exists", () => {
	for (const version of [1, 2]) {
		const { rows, details, mapping, event } = harness();
		const detail = { save() {} };
		details.set("partyA-id-core", detail);
		for (const log of [1, 2])
			mapping.recordLiquidationStart(
				{ ...event(log), parameters: ["starter", "partyA"].map(value => ({ value: { toAddress: () => bytes(value) } })) },
				false,
				version,
			);
		assert.equal(rows.length, 2);
		assert.deepEqual(
			rows.map(row => row.id),
			["tx-1", "tx-2"],
		);
		assert.equal(detail.startLogIndex, undefined, "end-of-block state cannot prove the ID of either start");
	}
});

test("modern liquidation lifecycle survives unavailable or mismatched historical state", () => {
	for (const v of [3, 4, 5, 6]) {
		for (const state of [null, { liquidationId: bytes("different-id") }]) {
			const saved = new Map();
			const schema = {
				Account: { load: () => null },
				LiquidationDetail: class {
					constructor(id) {
						this.id = id;
					}
					save() {
						saved.set(this.id, this);
					}
				},
			};
			const graph = { BigInt: { zero: () => number(0) } };
			const deps = {
				"../../BaseHandler": { BaseHandler: class {}, Version: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`v_0_8_${i}`, i])) },
				"@graphprotocol/graph-ts": graph,
				"../../utils/builders": {},
				"../../utils": { getGlobalCounterAndInc: () => number(1) },
				"../../../../generated/schema": schema,
				"../../VersionedQuoteLoader": { getLiquidationStateData: () => state, getPartyABalanceInfoData: () => null },
				"../../utils/profile": { setLiquidationDetailProfileRefs() {} },
				"../../utils/liquidationDetail": {},
			};
			for (let i = 2; i <= 6; i++) deps[`../../../../generated/symmio_0_8_${i}/symmio_0_8_${i}`] = {};
			const mapping = load("perps/common/handlers/symmio/LiquidatePartyAHandlerWithAccount.ts", deps);
			new mapping.LiquidatePartyAHandlerWithAccount().handle(
				{
					address: bytes("core"),
					transaction: { hash: bytes("tx") },
					block: { timestamp: number(123) },
					params: {
						partyA: bytes("a"),
						liquidationId: bytes("id"),
						liquidator: bytes("starter"),
						upnl: number(-5),
						totalUnrealizedLoss: number(-7),
						allocatedBalance: number(10),
					},
				},
				v,
			);
			const detail = saved.get("a-id-core");
			assert.ok(detail, `v${v} start must create the normalized lifecycle without state`);
			assert.equal(detail.liquidationId.toHexString(), "id");
			assert.equal(detail.upnl.toString(), "-5");
			assert.equal(detail.liquidator.toHexString(), "starter");
			assert.equal(detail.timestamp.toString(), "123");
			assert.equal(detail.liquidationTimestamp.toString(), "123");
		}
	}
});

test("bridge balance rows preserve bridge and protocol transaction identifiers", () => {
	let saved;
	const mapping = load("perps/analytics/handlers/symmio/TransferToBridgeHandler.ts", {
		"@graphprotocol/graph-ts": {},
		"../../../common/BaseHandler": { BaseHandler: class {}, Version: {} },
		"../../../../generated/schema": { Account: { load: () => null } },
		"../../../../generated/symmio_0_8_3/symmio_0_8_3": {},
		"../../utils/builders": { getConfiguration: () => ({ collateral: "token" }) },
		"../../utils/balanceChange": {
			newBalanceChange: () => ({
				save() {
					saved = this;
				},
			}),
			setBalanceChangeContext() {},
		},
		"../../utils/latestAccountBalance": { updatePartyALatestBalance() {} },
	});
	new mapping.TransferToBridgeHandler().handle(
		{
			address: "core",
			block: { timestamp: 1, number: 2 },
			transaction: { hash: "tx", input: "input" },
			params: { user: { toHexString: () => "account" }, amount: "1000000", bridgeAddress: "bridge", transactionId: "9007199254740993" },
		},
		4,
	);
	assert.equal(saved.bridgeAddress, "bridge");
	assert.equal(saved.bridgeTransactionId, "9007199254740993");
	assert.equal(saved.transaction, "tx");
});

test("new records are wired for every ABI that emits them, before nullable entity lookups", () => {
	for (let v = 0; v <= 6; v++) {
		const deps = JSON.parse(read(`perps/analytics/deps_symmio_0_8_${v}.json`));
		assert.ok(deps.LiquidationStart.includes("LiquidatePartyA"));
		const entry = read(`perps/analytics/src_symmio_0_8_${v}.ts`);
		assert.match(entry, /export function handleLiquidatePartyA\(/);
		if (v >= 3) assert.ok(deps.LiquidationStart.includes("DeferredLiquidatePartyA"));
		if (v >= 5) {
			assert.deepEqual(deps.QuoteFeeTotals, ["TradingFeeCharged"]);
			assert.deepEqual(deps.WithdrawFinalization, ["WithdrawFinalized"]);
		}
	}
	for (const [handler, record, lookup] of [
		["TradingFeeCharged", "accumulateQuoteFees<T>(_event)", "Account.load("],
		["WithdrawFinalized", "recordWithdrawFinalization<T>(_event, wr)", "if (!wr) return"],
	]) {
		const source = read(`perps/analytics/handlers/symmio/${handler}Handler.ts`);
		assert.ok(source.indexOf(record) > 0 && source.indexOf(record) < source.indexOf(lookup), handler);
	}
	for (const [handler, deferred] of [
		["LiquidatePartyA", false],
		["DeferredLiquidatePartyA", true],
	]) {
		const source = read(`perps/analytics/handlers/symmio/${handler}Handler.ts`);
		assert.ok(source.indexOf(`recordLiquidationStart(_event, ${deferred}, version)`) > source.indexOf("super.handle(_event, version)"));
	}
});

test("historical SEND_QUOTE remains mapped for every supported version", () => {
	const saved = [];
	const quoteEvents = load("perps/analytics/utils/quoteEvent.ts", {
		"@graphprotocol/graph-ts": {},
		"../../../generated/schema": {
			QuoteEvent: class {
				constructor(id) {
					this.id = id;
				}
				save() {
					saved.push(this);
				}
			},
		},
		"../../common/utils": { getGlobalCounterAndInc: () => saved.length },
	});
	class CommonHandler {
		handle() {}
		handleAccount() {}
		handleQuote() {}
		handleSymbol() {}
	}
	const params = {
		quotesCount() {
			return this;
		},
	};
	const quote = {
		symbolId: 1,
		quantity: 2,
		requestedOpenPrice: 3,
		positionType: 0,
		orderTypeOpen: 1,
		cva: 4,
		lf: 5,
		partyAmm: 6,
		partyBmm: 7,
		openDeadline: 8,
	};
	const handler = load("perps/analytics/handlers/symmio/SendQuoteHandler.ts", {
		"../../../common/handlers/symmio/SendQuoteHandlerWithAccount": { SendQuoteHandlerWithAccount: CommonHandler },
		"../../../../generated/schema": { Account: { load: () => ({}) }, Quote: { load: () => quote } },
		"@graphprotocol/graph-ts": { BigInt: { fromString: value => value } },
		"../../../common/BaseHandler": {},
		"../../utils/historyHelpers": {
			UpdateHistoriesParams: class {
				constructor() {
					return params;
				}
			},
			updateHistories() {},
		},
		"../../utils/activityHelpers": { updateActivityTimestamps() {} },
		"../../utils/openInterestHelpers": { catchUpHistories() {} },
		"../../utils/quoteEvent": quoteEvents,
		"../../utils/latestAccountBalance": { updatePartyALatestBalance() {} },
	});
	for (let v = 0; v <= 6; v++) {
		const deps = JSON.parse(read(`perps/analytics/deps_symmio_0_8_${v}.json`));
		assert.ok(deps.QuoteEvent.some(event => event === "SendQuote" || event.startsWith("SendQuote(")));
		new handler.SendQuoteHandler().handle(
			{
				address: { toHexString: () => "core" },
				block: { timestamp: 1600000000, number: 1 },
				transaction: { hash: { toHexString: () => "tx" } },
				logIndex: v,
				params: { quoteId: v + 1, partyA: { toHexString: () => "party-a" } },
			},
			v,
		);
	}
	assert.equal(saved.length, 7);
	assert.ok(saved.every(row => row.type === "SEND_QUOTE" && row.timestamp === 1600000000));
	assert.deepEqual(JSON.parse(saved[0].metadata), {
		symbolId: "1",
		quantity: "2",
		requestedOpenPrice: "3",
		positionType: "0",
		orderType: "1",
		cva: "4",
		lf: "5",
		partyAmm: "6",
		partyBmm: "7",
		deadline: "8",
	});
});
