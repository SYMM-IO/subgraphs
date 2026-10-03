import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { parse } from "graphql";

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

const bytes = value => ({ toHexString: () => value, equals: other => other.toHexString() === value });
const number = value => ({
	toString: () => String(value),
	plus: other => number(BigInt(value) + BigInt(other.toString())),
	minus: other => number(BigInt(value) - BigInt(other.toString())),
	neg: () => number(-BigInt(value)),
	equals: other => BigInt(value) === BigInt(other.toString()),
});
const Version = Object.fromEntries(Array.from({ length: 7 }, (_, v) => [`v_0_8_${v}`, v]));

function harness() {
	const tables = {},
		saves = [],
		warnings = [];
	const schema = {};
	for (const name of [
		"Quote",
		"LiquidationExecution",
		"WithdrawRequest",
		"BalanceChange",
		"BridgeTransaction",
		"WithdrawFinalizationHint",
		"WithdrawCoreLifecycleHint",
		"WithdrawRequestLookup",
		"WithdrawRequestAccountLookup",
	]) {
		const table = (tables[name] = new Map());
		schema[name] = class {
			constructor(id) {
				this.id = id;
				if (name === "Quote") {
					this.paidOpenFee = null;
					this.paidCloseFee = null;
				}
			}
			static load(id) {
				return table.get(id) ?? null;
			}
			save() {
				if (["LiquidationExecution", "BridgeTransaction"].includes(name)) assert.ok(!table.has(this.id), "immutable overwrite");
				table.set(this.id, this);
				saves.push(name);
			}
		};
	}
	const graph = {
		BigInt: { zero: () => number(0), fromI32: number },
		Address: { fromBytes: value => value },
		store: { remove: (name, id) => tables[name].delete(id) },
		log: { warning: (...args) => warnings.push(args) },
	};
	const mapping = load("perps/analytics/utils/execution.ts", {
		"@graphprotocol/graph-ts": graph,
		"../../../generated/schema": schema,
		"../../common/BaseHandler": { Version },
	});
	const event = (params = {}, log = 8, source = "core") => ({
		address: bytes(source),
		params,
		transaction: { hash: bytes("tx") },
		logIndex: number(log),
		block: { timestamp: number(123), number: number(456) },
	});
	return { mapping, tables, schema, graph, event, saves, warnings };
}

test("quote fees accumulate partial closes without changing existing rates, attribution or ordering", () => {
	const h = harness();
	const originals = new Map();
	for (const id of ["1-core", "2-core", "1-other"]) {
		const quote = new h.schema.Quote(id);
		Object.assign(quote, {
			partyA: bytes("owner"),
			affiliate: bytes("account-source"),
			tradingFee: number(15),
			closeFee: number(20),
			timestamp: number(50),
			blockNumber: number(60),
			globalCounter: number(70),
			action: "OpenPosition",
		});
		h.tables.Quote.set(id, quote);
		originals.set(id, { ...quote });
	}
	for (const [quoteId, amount, type, source] of [
		[1, "100000000000000000001", 0, "core"],
		[1, "9", 1, "core"],
		[1, "11", 1, "core"],
		[2, "7", 1, "core"],
		[1, "0", 0, "other"],
	]) {
		h.mapping.accumulateQuoteFees(
			h.event(
				{ quoteId: number(quoteId), amount: number(amount), _type: type, partyA: bytes("owner"), affiliate: bytes("fee-affiliate") },
				8,
				source,
			),
		);
	}
	assert.deepEqual(
		[...h.tables.Quote.values()].map(f => [f.id, f.paidOpenFee?.toString() ?? null, f.paidCloseFee?.toString() ?? null]),
		[
			["1-core", "100000000000000000001", "20"],
			["2-core", null, "7"],
			["1-other", "0", null],
		],
	);
	for (const [id, original] of originals) {
		const { paidOpenFee, paidCloseFee, feeAffiliate, ...unchanged } = h.tables.Quote.get(id);
		const { paidOpenFee: oldOpen, paidCloseFee: oldClose, ...expected } = original;
		assert.deepEqual(unchanged, expected);
		assert.equal(feeAffiliate.toHexString(), "fee-affiliate");
	}
	assert.deepEqual(h.saves, Array(5).fill("Quote"));
	assert.deepEqual(h.warnings, []);
});

test("missing quote history is reported without creating a fabricated quote", () => {
	const h = harness();
	h.mapping.accumulateQuoteFees(h.event({ quoteId: number(1), amount: number(9), _type: 0, affiliate: bytes("fee-affiliate") }));
	assert.deepEqual(h.saves, []);
	assert.equal(h.tables.Quote.size, 0);
	assert.match(h.warnings[0][0], /missing quote.*reindex/);
	assert.deepEqual(h.warnings[0][1], ["1-core", "tx", "8"]);
});

for (const quoteAvailable of [false, true]) {
	test(`fee enrichment preserves existing history updates (quote available: ${quoteAvailable})`, () => {
		const h = harness(),
			histories = [];
		if (quoteAvailable) h.tables.Quote.set("1-core", new h.schema.Quote("1-core"));
		class Params {
			symbolId(value) {
				this.symbol = value.toString();
				return this;
			}
			symbolTradesCount(value) {
				this.trades = value.toString();
				return this;
			}
			openFee(value) {
				this.open = value.toString();
				return this;
			}
			closeFee(value) {
				this.close = value.toString();
				return this;
			}
		}
		const { TradingFeeChargedHandler } = load("perps/analytics/handlers/symmio/TradingFeeChargedHandler.ts", {
			"../../../common/handlers/symmio/TradingFeeChargedHandler": {
				TradingFeeChargedHandler: class {
					handle() {}
				},
			},
			"../../../../generated/schema": { Account: { load: id => ({ id }) } },
			"@graphprotocol/graph-ts": h.graph,
			"../../../common/BaseHandler": { Version },
			"../../utils/execution": h.mapping,
			"../../utils/historyHelpers": { UpdateHistoriesParams: Params, updateHistories: params => histories.push({ ...params }) },
		});
		for (const [type, amount] of [
			[0, 11],
			[1, 2],
			[1, 3],
		]) {
			new TradingFeeChargedHandler().handle(
				h.event({
					quoteId: number(1),
					symbolId: number(7),
					partyA: bytes("owner"),
					partyB: bytes("solver"),
					affiliate: bytes("fee-affiliate"),
					_type: type,
					amount: number(amount),
				}),
				5,
			);
		}
		assert.deepEqual(histories, [
			{ symbol: "7", trades: "0", open: "11" },
			{ symbol: "7", trades: "0", close: "2" },
			{ symbol: "7", trades: "0", close: "3" },
		]);
		assert.equal(h.tables.Quote.get("1-core")?.paidCloseFee.toString(), quoteAvailable ? "5" : undefined);
		assert.equal(h.warnings.length, quoteAvailable ? 0 : 3);
	});
}

function liquidationEvent(h, version, name, log = 8) {
	const abi = JSON.parse(read(`configs/abis/symmio_0_8_${version}.json`));
	const definition = abi.filter(e => e.type === "event" && e.name === name).at(-1);
	const params = {
		liquidator: bytes(name === "LiquidatePositionsPartyA" ? "executor" : "starter"),
		partyA: bytes("owner"),
		liquidationId: bytes("emitted-lifecycle"),
		quoteIds: [number(21), number(22)],
		allocatedBalance: number(100),
		upnl: number(-5),
		totalUnrealizedLoss: number(-5),
		liquidationBlockNumber: number(99),
		liquidationTimestamp: number(88),
		liquidationAllocatedBalance: number(50),
		liquidatedAmounts: [number(3), number(5)],
		closeIds: [number(1), number(2)],
		averageClosedPrices: [number(20), number(30)],
	};
	const e = h.event(params, log);
	e.parameters = definition.inputs.map(input => ({
		value: {
			toAddress: () => {
				assert.equal(input.type, "address");
				return params[input.name];
			},
			toBytes: () => {
				assert.equal(input.type, "bytes");
				return params[input.name];
			},
			toBigInt: () => {
				assert.equal(input.type, "uint256");
				return params[input.name];
			},
		},
	}));
	return e;
}

for (const version of [0, 1, 2, 3, 4, 5, 6]) {
	test(`v0.8.${version} stores one immutable batch regardless of quote count or missing quote/state`, () => {
		const h = harness();
		const e = liquidationEvent(h, version, "LiquidatePositionsPartyA");
		e.params.quoteIds = Array.from({ length: 1000 }, (_, i) => number(i));
		h.mapping.recordLiquidationBatch(e, version);
		const row = h.tables.LiquidationExecution.get("tx-8");
		assert.equal(row.type, "POSITIONS");
		assert.equal(row.liquidator.toHexString(), "executor");
		assert.equal(row.quoteIds.length, 1000);
		assert.equal(row.liquidationId?.toHexString(), version >= 3 ? "emitted-lifecycle" : undefined);
		assert.deepEqual(h.saves, ["LiquidationExecution"]);
		h.mapping.recordLiquidationBatch(liquidationEvent(h, version, "LiquidatePositionsPartyA", 9), version);
		assert.equal(h.tables.LiquidationExecution.size, 2, "two batches in one transaction remain distinct");
	});
}

for (const version of [3, 4, 5, 6]) {
	test(`v0.8.${version} starts survive missing historical state without changing LiquidationDetail`, () => {
		const h = harness();
		for (const [deferred, log] of [
			[false, 8],
			[true, 9],
		]) {
			h.mapping.recordLiquidationStart(
				liquidationEvent(h, version, deferred ? "DeferredLiquidatePartyA" : "LiquidatePartyA", log),
				deferred,
				version,
			);
			const row = h.tables.LiquidationExecution.get(`tx-${log}`);
			assert.equal(row.liquidator.toHexString(), "starter");
			assert.equal(row.type, deferred ? "DEFERRED_START" : "START");
			assert.deepEqual(row.quoteIds, []);
			assert.equal(row.liquidationId.toHexString(), "emitted-lifecycle");
			assert.equal(row.liquidationBlockNumber?.toString(), deferred ? "99" : undefined);
			assert.equal(row.timestamp.toString(), "123", "block time, not signature time");
		}
		assert.deepEqual(h.saves, ["LiquidationExecution", "LiquidationExecution"]);
	});
}

test("legacy starts are not linked using guessed end-of-block state", () => {
	const h = harness();
	for (const version of [0, 1, 2]) h.mapping.recordLiquidationStart(h.event(), false, version);
	assert.deepEqual(h.saves, []);
});

function withdrawal(h) {
	const balance = { id: "tx-7", type: "WITHDRAW", source: bytes("core"), account: bytes("owner"), sender: bytes("signer"), amount: number(100) };
	const request = new h.schema.WithdrawRequest("owner-1-core");
	Object.assign(request, {
		requestId: number(1),
		source: bytes("core"),
		user: bytes("owner"),
		amount: number(100),
		status: "PROVIDER_ACCEPTED",
		transaction: bytes("initiation"),
		timestamp: number(10),
		updateTimestamp: number(20),
		blockNumber: number(30),
		globalCounter: number(40),
		providerStatus: "PROCESSED",
		providerProcessedTransaction: bytes("provider-processing"),
	});
	h.tables.BalanceChange.set(balance.id, balance);
	h.tables.WithdrawRequest.set(request.id, request);
	return { balance, request, event: h.event({ requestId: number(1), user: bytes("signer") }) };
}

test("withdrawal completion enriches the verified request without changing existing lifecycle fields", () => {
	const h = harness(),
		{ request, event } = withdrawal(h);
	const original = { ...request };
	h.tables.WithdrawRequest.set("signer-1-core", { id: "signer-1-core", user: bytes("signer") });
	h.mapping.recordWithdrawFinalization(event);
	assert.equal(request.finalizedBalanceChange, "tx-7");
	assert.equal(request.finalizedBy.toHexString(), "signer");
	assert.equal(request.finalizedTransaction.toHexString(), "tx");
	assert.equal(request.finalizedLogIndex.toString(), "8");
	assert.equal(request.finalizedBlockNumber.toString(), "456");
	assert.equal(request.finalizedAt.toString(), "123");
	for (const [field, value] of Object.entries(original)) assert.deepEqual(request[field], value, field);
	assert.equal(h.tables.WithdrawRequest.get("signer-1-core").finalizedTransaction, undefined);
	assert.deepEqual(h.saves, ["WithdrawRequest"]);
	assert.deepEqual(h.warnings, []);
});

for (const fault of [
	"missing-movement",
	"wrong-log",
	"wrong-core",
	"wrong-sender",
	"null-sender",
	"wrong-type",
	"missing-request",
	"wrong-owner",
	"wrong-amount",
	"wrong-request-core",
]) {
	test(`withdrawal ${fault} reports unmatched evidence without guessing or changing a request`, () => {
		const h = harness(),
			{ balance, request, event } = withdrawal(h);
		if (fault === "missing-movement") h.tables.BalanceChange.clear();
		if (fault === "wrong-log") event.logIndex = number(9);
		if (fault === "wrong-core") balance.source = bytes("other");
		if (fault === "wrong-sender") balance.sender = bytes("other");
		if (fault === "null-sender") balance.sender = null;
		if (fault === "wrong-type") balance.type = "DEPOSIT";
		if (fault === "missing-request") h.tables.WithdrawRequest.clear();
		if (fault === "wrong-owner") request.user = bytes("other");
		if (fault === "wrong-amount") request.amount = number(99);
		if (fault === "wrong-request-core") request.source = bytes("other");
		const original = { ...request };
		h.mapping.recordWithdrawFinalization(event);
		assert.deepEqual({ ...request }, original);
		assert.deepEqual(h.saves, []);
		assert.match(h.warnings[0][0], /Cannot match withdrawal finalization/);
		assert.equal(h.warnings[0][1][0], "1");
	});
}

test("multiple finalized requests sharing a transaction, signer and request ID use their exact preceding log", () => {
	const h = harness();
	const first = withdrawal(h);
	h.mapping.recordWithdrawFinalization(first.event);
	h.tables.BalanceChange.set("tx-9", { ...first.balance, id: "tx-9", account: bytes("second-owner") });
	const second = new h.schema.WithdrawRequest("second-owner-1-core");
	Object.assign(second, { source: bytes("core"), user: bytes("second-owner"), amount: number(100) });
	h.tables.WithdrawRequest.set(second.id, second);
	h.mapping.recordWithdrawFinalization(h.event(first.event.params, 10));
	assert.deepEqual(
		[...h.tables.WithdrawRequest.values()].map(r => [r.id, r.finalizedBalanceChange, r.finalizedLogIndex.toString()]),
		[
			["owner-1-core", "tx-7", "8"],
			["second-owner-1-core", "tx-9", "10"],
		],
	);
});

for (const version of [5, 6]) {
	for (const missingMovement of [false, true]) {
		test(`v0.8.${version} finalization keeps legacy status, lookup and aggregate behavior (missing movement: ${missingMovement})`, () => {
			const results = [];
			for (const enriched of [false, true]) {
				const h = harness();
				const { request, event } = withdrawal(h);
				if (missingMovement) h.tables.BalanceChange.clear();
				const legacy = load("perps/analytics/utils/withdrawRequest.ts", {
					"@graphprotocol/graph-ts": h.graph,
					"../../../generated/schema": h.schema,
				});
				legacy.addWithdrawRequestToLookup(request);
				legacy.recordWithdrawFinalizationHint(
					event.address,
					event.transaction.hash,
					event.params.user,
					request.user,
					request.amount,
					number(7),
					number(123),
				);
				const effects = [];
				const { WithdrawFinalizedHandler } = load("perps/analytics/handlers/symmio/WithdrawFinalizedHandler.ts", {
					"../../../common/handlers/symmio/WithdrawFinalizedHandler": {
						WithdrawFinalizedHandler: class {
							handle() {}
						},
					},
					"../../../../generated/schema": { Account: { load: () => ({ id: "owner" }) } },
					"@graphprotocol/graph-ts": h.graph,
					"../../../common/BaseHandler": { Version },
					"../../utils/withdrawRequest": legacy,
					"../../utils/execution": { recordWithdrawFinalization: enriched ? h.mapping.recordWithdrawFinalization : () => {} },
					"../../utils/latestAccountBalance": { updatePartyALatestBalance: () => effects.push("balance") },
					"../../utils/historyHelpers": {
						updateWithdrawHierarchyHistories: (_account, ...values) => effects.push(values.map(value => value.toString())),
					},
					"../../utils/affiliateExpressWithdrawComponents": {
						removeWithdrawRequestFromAffiliateExpressWithdrawComponents: () => effects.push("components"),
					},
				});
				new WithdrawFinalizedHandler().handle(event, version);
				assert.equal(request.status, "COMPLETED");
				assert.equal(request.updateTimestamp.toString(), "123");
				assert.equal(request.transaction.toHexString(), "initiation");
				assert.equal(request.providerProcessedTransaction.toHexString(), "provider-processing");
				assert.equal(request.blockNumber.toString(), "30");
				assert.equal(request.globalCounter.toString(), "40");
				assert.equal(request.finalizedTransaction?.toHexString(), enriched && !missingMovement ? "tx" : undefined);
				assert.equal(h.tables.WithdrawFinalizationHint.size, 0);
				assert.equal(h.tables.WithdrawRequestLookup.size, 0);
				assert.equal(h.tables.WithdrawRequestAccountLookup.size, 0);
				results.push(effects);
			}
			assert.deepEqual(results[0], results[1]);
			assert.deepEqual(results[0], [["123", "0", "-1", "1", "-100"], "components", "balance"]);
		});
	}
}

test("bridge stores protocol identity separately and preserves the original balance movement", () => {
	const h = harness();
	const balances = [];
	const mapping = load("perps/analytics/handlers/symmio/TransferToBridgeHandler.ts", {
		"@graphprotocol/graph-ts": h.graph,
		"../../../common/BaseHandler": { BaseHandler: class {}, Version },
		"../../../../generated/schema": { ...h.schema, Account: { load: () => ({ id: "owner" }) } },
		"../../../../generated/symmio_0_8_3/symmio_0_8_3": {},
		"../../utils/builders": { getConfiguration: () => ({ collateral: bytes("collateral") }) },
		"../../utils/balanceChange": {
			newBalanceChange: e => ({
				id: `tx-${e.logIndex}`,
				save() {
					balances.push(this);
				},
			}),
			setBalanceChangeContext() {},
		},
		"../../utils/latestAccountBalance": { updatePartyALatestBalance() {} },
	});
	for (const source of ["core", "other"]) {
		new mapping.TransferToBridgeHandler().handle(
			h.event(
				{ user: bytes("owner"), amount: number(123), bridgeAddress: bytes("bridge"), transactionId: number("999999999999999999999") },
				8,
				source,
			),
			4,
		);
	}
	assert.deepEqual(
		[...h.tables.BridgeTransaction.values()].map(r => r.id),
		["999999999999999999999-core", "999999999999999999999-other"],
	);
	assert.equal(balances.length, 2);
	assert.equal(balances[0].type, "BRIDGE");
	assert.equal(balances[0].amount.toString(), "123");
	assert.equal(balances[0].bridgeAddress, undefined);
});

test("existing models receive only optional owned data; bridge and liquidation stay separate", () => {
	const definitions = new Map(
		parse(read("perps/analytics/schema.graphql") + read("perps/common/models/Quote.graphql")).definitions.map(d => [d.name.value, d]),
	);
	for (const [model, absent] of [
		["Quote", ["paidFees", "liquidationDetail"]],
		["QuoteEvent", ["liquidationDetail"]],
		["BalanceChange", ["bridgeAddress", "bridgeTransactionId"]],
		["LiquidationDetail", ["startTimestamp", "startBlockNumber", "startLogIndex", "quotes"]],
	]) {
		const fields = definitions.get(model).fields.map(f => f.name.value);
		for (const field of absent) assert.ok(!fields.includes(field), `${model}.${field}`);
	}
	for (const [model, added] of [
		["Quote", ["paidOpenFee", "paidCloseFee", "feeAffiliate"]],
		[
			"WithdrawRequest",
			["finalizedAt", "finalizedBlockNumber", "finalizedTransaction", "finalizedLogIndex", "finalizedBy", "finalizedBalanceChange"],
		],
	]) {
		for (const name of added) {
			const field = definitions.get(model).fields.find(f => f.name.value === name);
			assert.ok(field, `${model}.${name}`);
			assert.equal(field.type.kind, "NamedType", `${model}.${name} must be nullable`);
		}
	}
	assert.ok(definitions.has("WithdrawFinalizationHint"), "original hint model remains");
	assert.ok(!definitions.has("QuoteFeeHint"), "no temporary fee/hint lifecycle");
	assert.ok(!definitions.has("QuoteFeeSummary"));
	assert.ok(!definitions.has("WithdrawFinalization"));
	for (const model of ["BridgeTransaction", "LiquidationExecution"]) {
		assert.equal(definitions.get(model).directives[0].arguments[0].value.value, true);
	}
});
