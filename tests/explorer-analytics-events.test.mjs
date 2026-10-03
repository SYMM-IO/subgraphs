import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "graphql";
import { loadSource, read } from "./helpers/source.mjs";

const bytes = value => ({ toHexString: () => value, equals: other => other.toHexString() === value });
const number = value => ({
	toString: () => String(value),
	isZero: () => BigInt(value) === 0n,
	plus: other => number(BigInt(value) + BigInt(other.toString())),
	minus: other => number(BigInt(value) - BigInt(other.toString())),
	neg: () => number(-BigInt(value)),
	equals: other => BigInt(value) === BigInt(other.toString()),
});
const Version = Object.fromEntries(Array.from({ length: 7 }, (_, v) => [`v_0_8_${v}`, v]));
const IMMUTABLE = ["BridgeTransaction", "LiquidationEvent"];

function harness() {
	const tables = {},
		saves = [],
		warnings = [];
	const schema = {};
	for (const name of [
		"Account",
		"Quote",
		"WithdrawRequest",
		"BalanceChange",
		"BridgeTransaction",
		"LiquidationDetail",
		"LiquidationEvent",
		"WithdrawFinalizationHint",
		"WithdrawCoreLifecycleHint",
		"WithdrawRequestLookup",
		"WithdrawRequestAccountLookup",
	]) {
		const table = (tables[name] = new Map());
		schema[name] = class {
			constructor(id) {
				this.id = id;
				if (name === "Quote") Object.assign(this, { paidOpenFee: null, paidCloseFee: null, closedAmount: null });
			}
			static load(id) {
				return table.get(id) ?? null;
			}
			save() {
				if (IMMUTABLE.includes(name)) assert.ok(!table.has(this.id), "immutable overwrite");
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
	const event = (params = {}, log = 8, source = "core") => ({
		address: bytes(source),
		params,
		transaction: { hash: bytes("tx"), input: bytes("0x") },
		logIndex: number(log),
		block: { timestamp: number(123), number: number(456) },
	});
	return { tables, schema, graph, event, saves, warnings };
}

function feeHandler(h, histories) {
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
	h.tables.Account.set("owner", { id: "owner" });
	const { TradingFeeChargedHandler } = loadSource("perps/analytics/handlers/symmio/TradingFeeChargedHandler.ts", {
		"../../../common/handlers/symmio/TradingFeeChargedHandler": {
			TradingFeeChargedHandler: class {
				handle() {}
			},
		},
		"../../../../generated/schema": h.schema,
		"@graphprotocol/graph-ts": h.graph,
		"../../../common/BaseHandler": { Version },
		"../../utils/historyHelpers": { UpdateHistoriesParams: Params, updateHistories: params => histories.push({ ...params }) },
	});
	const handler = new TradingFeeChargedHandler();
	return (quoteId, type, amount, source = "core") =>
		handler.handle(
			h.event(
				{
					quoteId: number(quoteId),
					symbolId: number(7),
					partyA: bytes("owner"),
					partyB: bytes("solver"),
					affiliate: bytes("fee-affiliate"),
					_type: type,
					amount: number(amount),
				},
				8,
				source,
			),
			5,
		);
}

function quote(h, id, fields = {}) {
	const row = new h.schema.Quote(id);
	Object.assign(row, { affiliate: bytes("account-source"), tradingFee: number(15), closeFee: number(20), ...fields });
	h.tables.Quote.set(id, row);
	return row;
}

const paid = row => [row.paidOpenFee?.toString() ?? null, row.paidCloseFee?.toString() ?? null];

test("quote fees sum partial closes per source while history updates stay unchanged", () => {
	const h = harness(),
		histories = [];
	const charge = feeHandler(h, histories);
	const rows = ["1-core", "2-core", "1-other"].map(id => quote(h, id));
	charge(1, 0, "100000000000000000001");
	charge(1, 1, "9");
	rows[0].closedAmount = number(1);
	charge(1, 1, "11");
	charge(2, 1, "7");
	charge(1, 0, "0", "other");
	assert.deepEqual(rows.map(paid), [
		["100000000000000000001", "20"],
		[null, "7"],
		["0", null],
	]);
	for (const row of rows) {
		assert.equal(row.feeAffiliate.toHexString(), "fee-affiliate");
		assert.equal(row.affiliate.toHexString(), "account-source", "account-source attribution is not overwritten");
		assert.equal(row.closeFee.toString(), "20", "configured rate is not overwritten");
	}
	assert.deepEqual(histories, [
		{ symbol: "7", trades: "0", open: "100000000000000000001" },
		{ symbol: "7", trades: "0", close: "9" },
		{ symbol: "7", trades: "0", close: "11" },
		{ symbol: "7", trades: "0", close: "7" },
		{ symbol: "7", trades: "0", open: "0" },
	]);
	assert.deepEqual(h.warnings, []);
});

test("close fees stay unknown when the quote was partly closed before fee events existed", () => {
	const h = harness();
	const charge = feeHandler(h, []);
	const partlyClosed = quote(h, "1-core", { closedAmount: number(5) });
	const neverClosed = quote(h, "2-core", { closedAmount: number(0) });
	charge(1, 1, "3");
	charge(1, 1, "4");
	charge(2, 1, "3");
	charge(2, 1, "4");
	assert.deepEqual(paid(partlyClosed), [null, null], "a partial post-upgrade sum must not look complete");
	assert.deepEqual(paid(neverClosed), [null, "7"], "a pre-upgrade open fee stays unknown");
});

test("fees for a missing quote are reported without fabricating it, and histories still update", () => {
	const h = harness(),
		histories = [];
	feeHandler(h, histories)(1, 0, "9");
	assert.equal(h.tables.Quote.size, 0);
	assert.equal(histories.length, 1);
	assert.match(h.warnings[0][0], /missing quote/);
	assert.deepEqual(h.warnings[0][1], ["1-core", "tx", "8"]);
});

function withdrawHarness() {
	const h = harness();
	const utils = loadSource("perps/analytics/utils/withdrawRequest.ts", {
		"@graphprotocol/graph-ts": h.graph,
		"../../../generated/schema": h.schema,
	});
	const balance = { id: "tx-7", type: "WITHDRAW", source: bytes("core"), account: bytes("owner"), sender: bytes("signer"), amount: number(100) };
	h.tables.BalanceChange.set(balance.id, balance);
	const request = new h.schema.WithdrawRequest("owner-1-core");
	Object.assign(request, {
		requestId: number(1),
		source: bytes("core"),
		user: bytes("owner"),
		amount: number(100),
		status: "PROVIDER_ACCEPTED",
		transaction: bytes("initiation"),
		updateTimestamp: number(20),
		blockNumber: number(30),
		globalCounter: number(40),
		finalizedBalanceChange: null,
	});
	h.tables.WithdrawRequest.set(request.id, request);
	return { h, utils, balance, request, event: h.event({ requestId: number(1), user: bytes("signer") }) };
}

test("finalization links the exact preceding Withdraw movement; the signer may differ from the owner", () => {
	const { h, utils, request, event } = withdrawHarness();
	utils.linkWithdrawFinalization(request, event, event.params.user);
	assert.equal(request.finalizedBalanceChange, "tx-7");
	assert.deepEqual(h.warnings, []);
});

for (const fault of ["missing-movement", "wrong-log", "wrong-core", "wrong-sender", "null-sender", "wrong-type", "wrong-owner", "wrong-amount"]) {
	test(`finalization with ${fault} is reported without guessing a link`, () => {
		const { h, utils, balance, request, event } = withdrawHarness();
		if (fault === "missing-movement") h.tables.BalanceChange.clear();
		if (fault === "wrong-log") event.logIndex = number(9);
		if (fault === "wrong-core") balance.source = bytes("other");
		if (fault === "wrong-sender") balance.sender = bytes("other");
		if (fault === "null-sender") balance.sender = null;
		if (fault === "wrong-type") balance.type = "DEPOSIT";
		if (fault === "wrong-owner") request.user = bytes("other");
		if (fault === "wrong-amount") request.amount = number(99);
		utils.linkWithdrawFinalization(request, event, event.params.user);
		assert.equal(request.finalizedBalanceChange, null);
		assert.match(h.warnings[0][0], /Cannot match withdraw request/);
	});
}

for (const legacyId of [false, true]) {
	test(`WithdrawFinalized completes and links requests stored under the ${legacyId ? "legacy" : "current"} id`, () => {
		const { h, utils, request, event } = withdrawHarness();
		if (legacyId) {
			h.tables.WithdrawRequest.delete(request.id);
			request.id = "1-core";
			h.tables.WithdrawRequest.set(request.id, request);
		}
		utils.addWithdrawRequestToLookup(request);
		utils.recordWithdrawFinalizationHint(
			event.address,
			event.transaction.hash,
			event.params.user,
			request.user,
			request.amount,
			number(7),
			number(123),
		);
		const effects = [];
		const { WithdrawFinalizedHandler } = loadSource("perps/analytics/handlers/symmio/WithdrawFinalizedHandler.ts", {
			"../../../common/handlers/symmio/WithdrawFinalizedHandler": {
				WithdrawFinalizedHandler: class {
					handle() {}
				},
			},
			"../../../../generated/schema": { Account: { load: () => ({ id: "owner" }) } },
			"@graphprotocol/graph-ts": h.graph,
			"../../../common/BaseHandler": { Version },
			"../../utils/withdrawRequest": utils,
			"../../utils/latestAccountBalance": { updatePartyALatestBalance: () => effects.push("balance") },
			"../../utils/historyHelpers": {
				updateWithdrawHierarchyHistories: (_account, ...values) => effects.push(values.map(value => value.toString())),
			},
			"../../utils/affiliateExpressWithdrawComponents": {
				removeWithdrawRequestFromAffiliateExpressWithdrawComponents: () => effects.push("components"),
			},
		});
		new WithdrawFinalizedHandler().handle(event, 5);
		assert.equal(request.status, "COMPLETED");
		assert.equal(request.finalizedBalanceChange, "tx-7");
		assert.equal(request.transaction.toHexString(), "initiation", "initiation provenance is kept");
		assert.equal(request.blockNumber.toString(), "30");
		assert.equal(h.tables.WithdrawFinalizationHint.size, 0);
		assert.equal(h.tables.WithdrawRequestLookup.size, 0);
		assert.deepEqual(effects, [["123", "0", "-1", "1", "-100"], "components", "balance"]);
		assert.deepEqual(h.warnings, []);
	});
}

function liquidationHarness() {
	const h = harness();
	const lifecycle = loadSource("perps/analytics/utils/liquidationEvent.ts", {
		"@graphprotocol/graph-ts": h.graph,
		"../../../generated/schema": h.schema,
		"../../common/BaseHandler": { Version },
		"../../common/VersionedQuoteLoader": { getLiquidationStateData: () => ({ liquidationId: bytes("state-lifecycle") }) },
		"../../common/utils": { getGlobalCounterAndInc: () => number(1) },
	});
	const shared = {
		"@graphprotocol/graph-ts": h.graph,
		"../../../common/BaseHandler": { Version },
		"../../utils/latestAccountBalance": { updatePartyALatestBalance() {} },
		"../../utils/liquidationEvent": lifecycle,
	};
	const { LiquidatePartyAHandler } = loadSource("perps/analytics/handlers/symmio/LiquidatePartyAHandler.ts", {
		...shared,
		"../../../common/handlers/symmio/LiquidatePartyAHandlerWithAccount": {
			LiquidatePartyAHandlerWithAccount: class {
				handle() {}
				handleQuote() {}
				handleSymbol() {}
				handleAccount() {}
			},
		},
		"../../utils/partyALiquidation": { startPartyALiquidationTracking() {} },
	});
	const { DeferredLiquidatePartyAHandler } = loadSource("perps/analytics/handlers/symmio/DeferredLiquidatePartyAHandler.ts", {
		...shared,
		"../../../common/handlers/symmio/DeferredLiquidatePartyAHandler": {
			DeferredLiquidatePartyAHandler: class {
				handle() {}
			},
		},
		"../../utils/partyALiquidation": { startPartyALiquidationTracking() {}, applyPartyALiquidationDeferredBalance() {} },
	});
	for (const id of ["owner-emitted-lifecycle-core", "owner-state-lifecycle-core"]) h.tables.LiquidationDetail.set(id, { id });
	const start = log => {
		const e = h.event({ liquidator: bytes(`starter-${log}`), partyA: bytes("owner"), liquidationId: bytes("emitted-lifecycle") }, log);
		e.parameters = [5, 5, 5, 5, 5, { value: { toBytes: () => bytes("emitted-lifecycle") } }];
		return e;
	};
	return { h, lifecycle, LiquidatePartyAHandler, DeferredLiquidatePartyAHandler, start };
}

test("liquidation starts record their executor on the existing LiquidationEvent row", () => {
	const { h, LiquidatePartyAHandler, DeferredLiquidatePartyAHandler, start } = liquidationHarness();
	new LiquidatePartyAHandler().handle(start(8), 5);
	new LiquidatePartyAHandler().handle(start(9), 2);
	new DeferredLiquidatePartyAHandler().handle(start(10), 5);
	assert.deepEqual(
		[...h.tables.LiquidationEvent.values()].map(row => [row.id, row.liquidationDetail, row.liquidator.toHexString()]),
		[
			["tx-8-LIQUIDATE_PARTY_A", "owner-emitted-lifecycle-core", "starter-8"],
			["tx-9-LIQUIDATE_PARTY_A", "owner-state-lifecycle-core", "starter-9"],
			["tx-10-LIQUIDATE_PARTY_A", "owner-emitted-lifecycle-core", "starter-10"],
		],
	);
});

test("other lifecycle events leave liquidator empty", () => {
	const { h, lifecycle } = liquidationHarness();
	lifecycle.createPartyALiquidationEvent(h.event(), bytes("owner"), bytes("emitted-lifecycle"), "SETTLE_PARTY_A", null);
	assert.equal(h.tables.LiquidationEvent.get("tx-8-SETTLE_PARTY_A").liquidator, null);
});

test("position batches and deferred starts write executor and insolvency block to their existing rows", () => {
	const batch = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts");
	assert.ok(batch.includes('"LIQUIDATE_POSITIONS", null, event.params.liquidator)'));
	const deferred = read("perps/common/handlers/symmio/DeferredLiquidatePartyAHandler.ts");
	assert.ok(deferred.includes("entity.liquidationBlockNumber = event.params.liquidationBlockNumber"));
});

test("bridge transfers keep protocol identity and reference their balance movement", () => {
	const h = harness();
	const balances = [];
	const mapping = loadSource("perps/analytics/handlers/symmio/TransferToBridgeHandler.ts", {
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
		[...h.tables.BridgeTransaction.values()].map(r => [r.id, r.source.toHexString(), r.bridge.toHexString(), r.balanceChange]),
		[
			["999999999999999999999-core", "core", "bridge", "tx-8"],
			["999999999999999999999-other", "other", "bridge", "tx-8"],
		],
	);
	assert.deepEqual(
		balances.map(b => [b.type, b.source.toHexString(), b.amount.toString()]),
		[
			["BRIDGE", "core", "123"],
			["BRIDGE", "other", "123"],
		],
	);
});

test("new explorer data is stored once instead of copying fields from referenced rows", () => {
	const definitions = new Map(
		parse(read("perps/analytics/schema.graphql") + read("perps/common/models/Quote.graphql")).definitions.map(d => [d.name.value, d]),
	);
	const fields = model => definitions.get(model).fields.map(f => f.name.value);
	const nullable = (model, name) => {
		const field = definitions.get(model).fields.find(f => f.name.value === name);
		assert.ok(field, `${model}.${name}`);
		assert.equal(field.type.kind, "NamedType", `${model}.${name} must be nullable`);
	};
	// The BalanceChange owns account, amount, and EVM provenance; source is the usual core scope key.
	assert.deepEqual(fields("BridgeTransaction"), ["id", "source", "transactionId", "bridge", "balanceChange"]);
	// The linked Withdraw movement owns completion time, block, transaction, and signer.
	assert.deepEqual(
		fields("WithdrawRequest").filter(name => name.startsWith("finalized")),
		["finalizedBalanceChange"],
	);
	// LiquidationEvent already has one row per start and batch; QuoteEvent lists the batch quotes.
	assert.ok(!definitions.has("LiquidationExecution"));
	nullable("LiquidationEvent", "liquidator");
	nullable("LiquidationDetail", "liquidationBlockNumber");
	for (const name of ["paidOpenFee", "paidCloseFee", "feeAffiliate", "closedAmount"]) nullable("Quote", name);
});
