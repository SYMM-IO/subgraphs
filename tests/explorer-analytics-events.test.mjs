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
		"@graphprotocol/graph-ts": {},
		"../../../generated/schema": {
			TradingFeePayment: model("fee"),
			WithdrawFinalization: model("finalization"),
			LiquidationStart: model("start"),
		},
	});
	const event = log => ({
		address: "core",
		transaction: { hash: { toHexString: () => "tx" } },
		logIndex: log,
		block: { timestamp: 123, number: 456 },
	});
	return { rows, mapping, event };
}

test("fee payments retain exact per-quote amounts in shared transactions", () => {
	const { rows, mapping, event } = harness();
	for (const [quoteId, log, amount, type] of [
		[1, 3, "100000000000000000001", 0],
		[2, 4, "7", 1],
		[1, 5, "9", 1],
	]) {
		mapping.recordTradingFeePayment({
			...event(log),
			params: { quoteId, amount, _type: type, partyA: "a", partyB: "b", symbolId: 42, affiliate: "affiliate" },
		});
	}
	assert.deepEqual(
		rows.map(row => [row.id, row.quoteId, row.amount, row.feeType]),
		[
			["tx-3", 1, "100000000000000000001", 0],
			["tx-4", 2, "7", 1],
			["tx-5", 1, "9", 1],
		],
	);
	assert.ok(rows.every(row => row.source === "core" && row.partyA === "a" && row.affiliate === "affiliate"));
});

test("withdraw finalizations retain exact log identity and emitted signer without request resolution", () => {
	const { rows, mapping, event } = harness();
	for (const log of [10, 12]) mapping.recordWithdrawFinalization({ ...event(log), params: { requestId: 5, user: "finalizer-not-owner" } });
	assert.deepEqual(
		rows.map(row => [row.id, row.logIndex, row.requestId, row.user]),
		[
			["tx-10", 10, 5, "finalizer-not-owner"],
			["tx-12", 12, 5, "finalizer-not-owner"],
		],
	);
});

test("every supported liquidation-start ABI is retained without synthetic state", () => {
	const { rows, mapping, event } = harness();
	for (let v = 0; v <= 6; v++) {
		const abi = JSON.parse(read(`configs/abis/symmio_0_8_${v}.json`));
		for (const definition of abi.filter(item => item.type === "event" && ["LiquidatePartyA", "DeferredLiquidatePartyA"].includes(item.name))) {
			const values = {};
			const parameters = definition.inputs.map((input, i) => {
				const value = input.type === "address" || input.type === "bytes" ? `value-${input.name}` : String(i * 10);
				values[input.name] = value;
				return { name: input.name, value: { toAddress: () => value, toBytes: () => value, toBigInt: () => value } };
			});
			mapping.recordLiquidationStart({ ...event(rows.length), parameters }, definition.name === "DeferredLiquidatePartyA");
			const row = rows.at(-1);
			for (const [name, value] of Object.entries(values)) assert.equal(row[name], value, `${v}:${name}`);
			if (v < 3) assert.equal(row.liquidationId, undefined);
			assert.equal(row.deferred, definition.name === "DeferredLiquidatePartyA");
		}
	}
	assert.equal(rows.length, 11);
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
			assert.deepEqual(deps.TradingFeePayment, ["TradingFeeCharged"]);
			assert.deepEqual(deps.WithdrawFinalization, ["WithdrawFinalized"]);
		}
	}
	for (const [handler, record, lookup] of [
		["TradingFeeCharged", "recordTradingFeePayment<T>(_event)", "Account.load("],
		["WithdrawFinalized", "recordWithdrawFinalization<T>(_event)", "resolveWithdrawRequest("],
		["LiquidatePartyA", "recordLiquidationStart(_event, false)", "super.handle("],
		["DeferredLiquidatePartyA", "recordLiquidationStart(_event, true)", "super.handle("],
	]) {
		const source = read(`perps/analytics/handlers/symmio/${handler}Handler.ts`);
		assert.ok(source.indexOf(record) > 0 && source.indexOf(record) < source.indexOf(lookup), handler);
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
