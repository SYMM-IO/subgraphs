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

function harness(liquidationState = null) {
	const rows = [];
	const quotes = new Map();
	const hints = new Map();
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
	const quoteEvents = load("perps/analytics/utils/quoteEvent.ts", {
		"@graphprotocol/graph-ts": {},
		"../../../generated/schema": {},
		"../../common/utils": {},
	});
	const liquidationEvents = load("perps/analytics/utils/liquidationEvent.ts", {
		"@graphprotocol/graph-ts": {},
		"../../../generated/schema": {
			LiquidationDetail: { load: id => details.get(id) ?? null },
			LiquidationEvent: model("liquidation"),
		},
		"../../common/BaseHandler": { Version: { v_0_8_3: 3 } },
		"../../common/VersionedQuoteLoader": { getLiquidationStateData: () => liquidationState },
		"../../common/utils": { getGlobalCounterAndInc: () => number(rows.length) },
		"./quoteEvent": quoteEvents,
	});
	const feesAndWithdrawals = load("perps/analytics/utils/explorerEvents.ts", {
		"../../common/BaseHandler": { Version: { v_0_8_3: 3 } },
		"@graphprotocol/graph-ts": {
			BigInt: { zero: () => number(0), fromI32: number },
			store: {
				remove: (entity, id) => {
					assert.equal(entity, "QuoteFeeHint");
					hints.delete(id);
				},
			},
		},
		"./quoteEvent": quoteEvents,
		"../../../generated/schema": {
			LiquidationDetail: { load: id => details.get(id) ?? null },
			Quote: { load: id => quotes.get(id) ?? null },
			QuoteFeeHint: class {
				constructor(id) {
					this.id = id;
					this.paidOpenFee = null;
					this.paidCloseFee = null;
				}
				static load(id) {
					return hints.get(id) ?? null;
				}
				save() {
					hints.set(this.id, this);
				}
			},
			DebugEntity: model("debug"),
		},
	});
	const event = log => ({
		address: bytes("core"),
		transaction: { hash: { toHexString: () => "tx" } },
		logIndex: log,
		block: { timestamp: 123, number: 456 },
	});
	const createQuote = (id, source = "core", partyA = "a") => {
		const quote = {
			id: `${id}-${source}`,
			source: bytes(source),
			partyA: bytes(partyA),
			affiliate: bytes("account-source"),
			paidOpenFee: null,
			paidCloseFee: null,
			save() {
				quotes.set(this.id, this);
			},
		};
		quote.save();
		return quote;
	};
	return { rows, quotes, hints, details, mapping: { ...feesAndWithdrawals, ...liquidationEvents }, event, createQuote };
}

const bytes = value => ({ toHexString: () => value, equals: other => other.toHexString() === value });
const number = value => ({
	toString: () => String(value),
	plus: other => number(BigInt(value) + BigInt(other.toString())),
	minus: other => number(BigInt(value) - BigInt(other.toString())),
	equals: other => BigInt(value) === BigInt(other.toString()),
	neg: () => number(-BigInt(value)),
});

test("paid fee totals live on Quote and preserve partial closes, attribution and source isolation", () => {
	const { rows, quotes, hints, mapping, event, createQuote } = harness();
	createQuote(1);
	createQuote(2);
	for (const [quoteId, log, amount, type] of [
		[1, 3, "100000000000000000001", 0],
		[2, 4, "7", 1],
		[1, 5, "9", 1],
		[1, 6, "11", 1],
	]) {
		mapping.accumulateQuoteFees({
			...event(log),
			params: { quoteId, amount: number(amount), _type: type, partyA: bytes("a"), affiliate: bytes("fee-affiliate") },
		});
	}
	assert.deepEqual(
		[...quotes.values()].map(row => [row.id, row.paidOpenFee?.toString() ?? null, row.paidCloseFee?.toString() ?? null]),
		[
			["1-core", "100000000000000000001", "20"],
			["2-core", null, "7"],
		],
	);
	assert.equal(rows.length, 0, "normal fee flow must not emit raw rows");
	assert.equal(hints.size, 0, "indexed quotes must not have a second fee entity");
	assert.equal(quotes.get("1-core").affiliate.toHexString(), "account-source");
	assert.equal(quotes.get("1-core").paidFeeAffiliate.toHexString(), "fee-affiliate");
	assert.equal(quotes.get("1-core").paidFeesTimestamp, 123);
	assert.equal(quotes.get("1-core").paidFeesBlockNumber, 456);
	createQuote(1, "other-core");
	mapping.accumulateQuoteFees({
		...event(7),
		address: bytes("other-core"),
		params: { quoteId: 1, amount: number(0), _type: 0, partyA: bytes("a"), affiliate: bytes("fee-affiliate") },
	});
	assert.equal(quotes.size, 3, "same quote ID on another core must remain separate");
	assert.equal(quotes.get("1-other-core").paidOpenFee.toString(), "0", "emitted zero differs from absent fee coverage");
	assert.equal(quotes.get("1-other-core").paidCloseFee, null);
});

test("unmatched fees are consumed once when their quote appears, without inventing a quote", () => {
	for (const consumeOnNextCharge of [false, true]) {
		const { quotes, hints, mapping, event, createQuote } = harness();
		for (const [amount, type] of [
			[0, 0],
			[9, 1],
			[11, 1],
		]) {
			mapping.accumulateQuoteFees({
				...event(1),
				params: { quoteId: 1, amount: number(amount), _type: type, partyA: bytes("a"), affiliate: bytes("fee-affiliate") },
			});
		}
		assert.equal(quotes.size, 0);
		assert.equal(hints.size, 1);
		assert.equal(hints.get("1-core").paidCloseFee.toString(), "20");
		const quote = createQuote(1);
		if (consumeOnNextCharge) {
			mapping.accumulateQuoteFees({
				...event(2),
				params: { quoteId: 1, amount: number(3), _type: 1, partyA: bytes("a"), affiliate: bytes("fee-affiliate") },
			});
		} else {
			mapping.consumeQuoteFeeHint(quote);
		}
		mapping.consumeQuoteFeeHint(quote);
		assert.equal(hints.size, 0, "consumed hints must be removed");
		assert.equal(quote.paidOpenFee.toString(), "0");
		assert.equal(quote.paidCloseFee.toString(), consumeOnNextCharge ? "23" : "20");
		assert.equal(quote.affiliate.toHexString(), "account-source");
	}
});

test("fee hints never attach to a quote with unproven PartyA or source", () => {
	const { hints, mapping, event, createQuote } = harness();
	const quote = createQuote(1, "core", "wrong-owner");
	mapping.accumulateQuoteFees({
		...event(1),
		params: { quoteId: 1, amount: number(8), _type: 0, partyA: bytes("a"), affiliate: bytes("fee-affiliate") },
	});
	assert.equal(quote.paidOpenFee, null);
	mapping.consumeQuoteFeeHint(quote);
	assert.equal(hints.size, 1);
	quote.partyA = bytes("a");
	quote.source = bytes("wrong-core");
	mapping.consumeQuoteFeeHint(quote);
	assert.equal(hints.size, 1);
	quote.source = bytes("core");
	mapping.consumeQuoteFeeHint(quote);
	assert.equal(quote.paidOpenFee.toString(), "8");
	assert.equal(quote.paidCloseFee, null);
	assert.equal(hints.size, 0);
});

test("quote schema owns nullable fee totals and the old normal fee entity is removed", () => {
	const document = parse(read("perps/common/models/Quote.graphql"));
	const quote = document.definitions.find(type => type.name.value === "Quote");
	for (const name of ["paidOpenFee", "paidCloseFee", "paidFeeAffiliate", "paidFeesTimestamp", "paidFeesBlockNumber"]) {
		const field = quote.fields.find(field => field.name.value === name);
		assert.ok(field, name);
		assert.equal(field.type.kind, "NamedType", `${name} must remain nullable for historical quotes`);
	}
	assert.ok(!quote.fields.some(field => field.name.value === "paidFees"));
	assert.doesNotMatch(read("perps/analytics/schema.graphql"), /type QuoteFeeTotals\b/);
});

test("both quote creation paths consume pending fees before unrelated account lookups", () => {
	for (const name of ["SendQuote", "AcceptCancelRequest"]) {
		const { quotes, hints, mapping, event, createQuote } = harness();
		mapping.accumulateQuoteFees({
			...event(1),
			params: { quoteId: 1, amount: number(6), _type: 1, partyA: bytes("a"), affiliate: bytes("fee-affiliate") },
		});
		class CommonHandler {
			handle() {}
			handleQuote() {
				createQuote(1);
			}
			handleSymbol() {}
			handleAccount() {}
		}
		const parent = name === "SendQuote" ? "SendQuoteHandlerWithAccount" : "AcceptCancelRequestHandler";
		const handler = load(`perps/analytics/handlers/symmio/${name}Handler.ts`, {
			[`../../../common/handlers/symmio/${parent}`]: { [parent]: CommonHandler },
			"../../../../generated/schema": { Account: { load: () => null }, Quote: { load: id => quotes.get(id) ?? null } },
			"@graphprotocol/graph-ts": {},
			"../../../common/BaseHandler": {},
			"../../utils/historyHelpers": {},
			"../../utils/activityHelpers": {},
			"../../utils/openInterestHelpers": {},
			"../../utils/quoteEvent": { createQuoteEvent() {} },
			"../../utils/latestAccountBalance": { updatePartyALatestBalance() {} },
			"../../utils/symbolAdjustment": { markSymbolRestatementMutation() {} },
			"../../utils/explorerEvents": mapping,
		});
		new handler[`${name}Handler`]().handle({ ...event(2), params: { quoteId: 1, partyA: bytes("a") } }, 5);
		assert.equal(quotes.get("1-core").paidCloseFee.toString(), "6", name);
		assert.equal(hints.size, 0, name);
	}
});

test("SendQuote preserves paid fees when an existing quote is initialized again", () => {
	const { quotes, mapping, event, createQuote } = harness();
	createQuote(1);
	mapping.accumulateQuoteFees({
		...event(1),
		params: { quoteId: 1, amount: number(7), _type: 0, partyA: bytes("a"), affiliate: bytes("fee-affiliate") },
	});
	const account = { accountSource: bytes("account-source"), save() {} };
	const handler = load("perps/common/handlers/symmio/SendQuoteHandler.ts", {
		"../../../../generated/schema": {
			Account: { load: () => account },
			Quote: class {
				constructor(id) {
					this.id = id;
				}
				static load(id) {
					return quotes.get(id) ?? null;
				}
				save() {
					// Graph store.set merges supplied fields; an unset property does not erase stored data.
					quotes.set(this.id, { ...quotes.get(this.id), ...this });
				}
			},
		},
		"@graphprotocol/graph-ts": { BigInt: { zero: () => number(0), fromI32: number } },
		"../../BaseHandler": {
			BaseHandler: class {
				handleGlobalCounter() {
					return number(1);
				}
			},
			Version: { v_0_8_0: 0, v_0_8_3: 3 },
		},
		"../../VersionedQuoteLoader": {
			getQuoteData: () => ({ maxFundingRate: number(1), closeFee: number(2), affiliate: bytes("raw-affiliate") }),
			getSymbolName: () => "BTC",
		},
		"../../utils/quote": { addQuoteToPendingList() {}, setEventTimestampAndTransactionHashAndAction() {} },
		"../../../analytics/utils/constants": {},
		"../../utils/builders": {},
		"../../utils/profile": { updateQuoteHierarchyCounters() {} },
		"../../../analytics/utils/historyHelpers": { updateQuoteBucketHierarchyHistoriesForQuote() {} },
	});
	new handler.SendQuoteHandler().handleQuote(
		{
			...event(2),
			params: { quoteId: 1, partyA: bytes("a"), partyBsWhiteList: [] },
			parameters: Array.from({ length: 16 }, () => ({ value: { toBigInt: () => number(1), toI32: () => 0 } })),
		},
		5,
	);
	assert.equal(quotes.get("1-core").paidOpenFee.toString(), "7");
	assert.equal(quotes.get("1-core").paidFeeAffiliate.toHexString(), "fee-affiliate");
	assert.equal(quotes.get("1-core").affiliate.toHexString(), "account-source");
});

test("unresolved finalizations retain exact diagnostic evidence without inventing a request", () => {
	const { rows, mapping, event } = harness();
	for (const log of [10, 12])
		mapping.recordWithdrawFinalization({ ...event(log), params: { requestId: 5, user: bytes("finalizer-not-owner") } }, null);
	assert.deepEqual(
		rows.map(row => [row.id, row.kind, JSON.parse(row.message)]),
		[10, 12].map(log => [
			`WithdrawFinalized-unresolved-tx-${log}`,
			"debug",
			{
				source: "core",
				requestId: "5",
				signer: "finalizer-not-owner",
				transaction: "tx",
				logIndex: String(log),
				blockNumber: "456",
				timestamp: "123",
			},
		]),
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
			WithdrawFinalizationHint: { load: () => null },
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

test("existing withdrawal hints and resolver calls remain compatible with exact log matching", () => {
	const hints = new Map(),
		requests = new Map(),
		balances = new Map();
	const source = bytes("core"),
		transaction = bytes("tx"),
		signer = bytes("signer");
	const owner = { user: bytes("owner"), source, amount: number(10), status: "PENDING" };
	const signerRequest = { user: signer, source, amount: number(10), status: "PENDING" };
	requests.set("owner-1-core", owner);
	requests.set("signer-1-core", signerRequest);
	const mapping = load("perps/analytics/utils/withdrawRequest.ts", {
		"@graphprotocol/graph-ts": {
			BigInt: { fromI32: number },
			store: {
				remove: (type, id) => {
					assert.equal(type, "WithdrawFinalizationHint");
					hints.delete(id);
				},
			},
		},
		"../../../generated/schema": {
			BalanceChange: { load: id => balances.get(id) ?? null },
			WithdrawRequest: { load: id => requests.get(id) ?? null },
			WithdrawFinalizationHint: class {
				constructor(id) {
					this.id = id;
				}
				static load(id) {
					return hints.get(id) ?? null;
				}
				save() {
					hints.set(this.id, this);
				}
			},
		},
	});
	assert.ok(mapping.isFinalizeWithdrawRequestCall(bytes("0x1531b3c80000")));
	assert.equal(mapping.isFinalizeWithdrawRequestCall(bytes("0x12345678")), false);
	mapping.recordWithdrawFinalizationHint(source, transaction, signer, owner.user, owner.amount, number(10), number(123));
	assert.equal(hints.get("core-tx-signer").logIndex.toString(), "10");
	assert.equal(mapping.resolveWithdrawRequest(signer, number(1), source, transaction), owner);
	assert.equal(hints.size, 0, "the original resolver still consumes its hint");
	assert.equal(mapping.resolveWithdrawRequest(signer, number(1), source, transaction), signerRequest);
	balances.set("tx-10", { type: "WITHDRAW", source, sender: signer, account: owner.user, amount: owner.amount });
	for (const log of [11, 12]) {
		mapping.recordWithdrawFinalizationHint(source, transaction, signer, signer, owner.amount, number(9), number(123));
		assert.equal(mapping.resolveWithdrawRequest(signer, number(1), source, transaction, number(log)), log === 11 ? owner : null);
		assert.equal(hints.size, 0, "exact finalization also clears the original transaction hint");
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

test("COTI start provenance enriches LiquidationDetail without a separate event model", () => {
	const { rows, details, mapping, event } = harness();
	for (const v of [4, 5]) {
		const abi = JSON.parse(read(`configs/abis/symmio_0_8_${v}.json`));
		for (const definition of abi.filter(item => item.type === "event" && ["LiquidatePartyA", "DeferredLiquidatePartyA"].includes(item.name))) {
			const detail = { id: "partyA-liquidationId-core", settled: false, save() {} };
			details.set("partyA-liquidationId-core", detail);
			const parameters = definition.inputs.map(input => ({
				name: input.name,
				value: { toAddress: () => bytes(input.name), toBytes: () => bytes(input.name), toBigInt: () => number(99) },
			}));
			mapping.recordLiquidationStart({ ...event(10), parameters }, definition.name === "DeferredLiquidatePartyA", v);
			assert.equal(detail.startLogIndex, 10);
			assert.equal(detail.startTimestamp, 123);
			assert.equal(detail.startBlockNumber, 456);
			assert.equal(detail.deferred, definition.name === "DeferredLiquidatePartyA");
			if (detail.deferred) assert.equal(detail.liquidationBlockNumber.toString(), "99");
			details.clear();
			mapping.recordLiquidationStart({ ...event(11), parameters }, definition.name === "DeferredLiquidatePartyA", v);
			assert.equal(details.size, 0, "do not invent a second lifecycle when its detail is unavailable");
		}
	}
	assert.equal(rows.length, 0, "start provenance belongs to the existing aggregate");
});

test("immediate and deferred start handlers each append one lifecycle entry across modern versions", () => {
	for (const version of [3, 4, 5, 6])
		for (const deferred of [false, true]) {
			const { rows, details, mapping, event } = harness();
			const name = deferred ? "DeferredLiquidatePartyA" : "LiquidatePartyA";
			const parent = deferred ? `${name}Handler` : "LiquidatePartyAHandlerWithAccount";
			const detail = { id: "partyA-liquidationId-core", save() {} };
			class CommonHandler {
				handle() {
					details.set(detail.id, detail);
				}
				handleQuote() {}
				handleSymbol() {}
				handleAccount() {}
			}
			const handler = load(`perps/analytics/handlers/symmio/${name}Handler.ts`, {
				[`../../../common/handlers/symmio/${parent}`]: { [parent]: CommonHandler },
				"@graphprotocol/graph-ts": {},
				"../../../common/BaseHandler": { Version: { v_0_8_3: 3, v_0_8_6: 6 } },
				"../../utils/liquidationEvent": mapping,
				"../../utils/explorerEvents": mapping,
				"../../utils/latestAccountBalance": { updatePartyALatestBalance() {} },
				"../../utils/partyALiquidation": { startPartyALiquidationTracking() {}, applyPartyALiquidationDeferredBalance() {} },
			});
			const definition = JSON.parse(read(`configs/abis/symmio_0_8_${version}.json`)).find(
				entry => entry.type === "event" && entry.name === name,
			);
			const parameters = definition.inputs.map(input => ({
				name: input.name,
				value: { toAddress: () => bytes(input.name), toBytes: () => bytes(input.name), toBigInt: () => number(99) },
			}));
			new handler[`${name}Handler`]().handle(
				{ ...event(1), parameters, params: { partyA: bytes("partyA"), liquidationId: bytes("liquidationId") } },
				version,
			);
			assert.equal(rows.length, 1, `${name} v${version}: no duplicate immutable event writes`);
			assert.equal(rows[0].liquidationDetail, detail.id);
			assert.equal(rows[0].type, "LIQUIDATE_PARTY_A");
			assert.equal(rows[0].metadata, null, "preserve the existing lifecycle event payload");
			assert.equal(detail.deferred, deferred);
		}
});

test("COTI enrichment leaves legacy state-based liquidation history unchanged", () => {
	for (const version of [1, 2]) {
		const state = { liquidationId: bytes("legacy-id"), timestamp: number(99), upnl: number(-5), totalUnrealizedLoss: number(-7) };
		const { rows, details, mapping, event } = harness(state);
		const schema = {
			Account: { load: () => null },
			LiquidationDetail: class {
				constructor(id) {
					this.id = id;
				}
				static load(id) {
					return details.get(id) ?? null;
				}
				save() {
					details.set(this.id, this);
				}
			},
		};
		const graph = { BigInt: { zero: () => number(0) } };
		const base = {
			BaseHandler: class {
				handleQuote() {}
				handleSymbol() {}
				handleAccount() {}
			},
			Version: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`v_0_8_${i}`, i])),
		};
		const deps = {
			"../../BaseHandler": base,
			"@graphprotocol/graph-ts": graph,
			"../../utils/builders": { AccountType: {}, createNewAccountIfNotExists: () => ({ save() {} }) },
			"../../utils": { getGlobalCounterAndInc: () => number(1) },
			"../../../../generated/schema": schema,
			"../../VersionedQuoteLoader": { getLiquidationStateData: () => state, getPartyABalanceInfoData: () => null },
			"../../utils/profile": { setLiquidationDetailProfileRefs() {} },
			"../../utils/liquidationDetail": {},
		};
		for (let i = 2; i <= 6; i++) deps[`../../../../generated/symmio_0_8_${i}/symmio_0_8_${i}`] = {};
		const common = load("perps/common/handlers/symmio/LiquidatePartyAHandlerWithAccount.ts", deps);
		const handler = load("perps/analytics/handlers/symmio/LiquidatePartyAHandler.ts", {
			"../../../common/handlers/symmio/LiquidatePartyAHandlerWithAccount": common,
			"@graphprotocol/graph-ts": graph,
			"../../../common/BaseHandler": base,
			"../../utils/latestAccountBalance": { updatePartyALatestBalance() {} },
			"../../utils/liquidationEvent": mapping,
			"../../utils/explorerEvents": mapping,
			"../../utils/partyALiquidation": {},
		});
		for (const log of [1, 2]) {
			new handler.LiquidatePartyAHandler().handle(
				{
					...event(log),
					params: {
						partyA: bytes("a"),
						liquidator: bytes("starter"),
						upnl: number(-5),
						totalUnrealizedLoss: number(-7),
						allocatedBalance: number(10),
					},
					parameters: ["starter", "a"].map(value => ({ value: { toAddress: () => bytes(value) } })),
				},
				version,
			);
		}
		assert.equal(rows.length, 2);
		assert.ok(
			rows.every(row => row.type === "LIQUIDATE_PARTY_A" && row.liquidationDetail === "a-legacy-id-core"),
			"retain the original state-based relationship for legacy networks",
		);
		const detail = details.get("a-legacy-id-core");
		assert.equal(detail.liquidator.toHexString(), "starter");
		assert.equal(detail.liquidationStartTransaction.toHexString(), "tx");
		assert.equal(detail.startLogIndex, undefined, "new provenance requires an emitted lifecycle ID");
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

test("bridge transactions own bridge identity and link to unchanged balance movements", () => {
	const balances = new Map(),
		transactions = new Map();
	const mapping = load("perps/analytics/handlers/symmio/TransferToBridgeHandler.ts", {
		"@graphprotocol/graph-ts": {},
		"../../../common/BaseHandler": { BaseHandler: class {}, Version: {} },
		"../../../../generated/schema": {
			Account: { load: () => null },
			BridgeTransaction: class {
				constructor(id) {
					this.id = id;
				}
				save() {
					transactions.set(this.id, this);
				}
			},
		},
		"../../../../generated/symmio_0_8_3/symmio_0_8_3": {},
		"../../utils/builders": { getConfiguration: () => ({ collateral: "token" }) },
		"../../utils/balanceChange": {
			newBalanceChange: event => ({
				id: event.transaction.hash.toHexString() + "-" + event.logIndex,
				save() {
					balances.set(this.id, this);
				},
			}),
			setBalanceChangeContext() {},
		},
		"../../utils/latestAccountBalance": { updatePartyALatestBalance() {} },
	});
	for (const [source, log] of [
		["core", 1],
		["other-core", 2],
	])
		new mapping.TransferToBridgeHandler().handle(
			{
				address: bytes(source),
				logIndex: log,
				block: { timestamp: 1, number: 2 },
				transaction: { hash: bytes("tx"), input: "input" },
				params: { user: { toHexString: () => "account" }, amount: "1000000", bridgeAddress: "bridge", transactionId: "9007199254740993" },
			},
			4,
		);
	assert.equal(transactions.size, 2, "protocol ids are core-scoped and retain BigInt precision");
	for (const [source, log] of [
		["core", 1],
		["other-core", 2],
	]) {
		const transaction = transactions.get(`9007199254740993-${source}`);
		assert.equal(transaction.bridge, "bridge");
		assert.equal(transaction.transactionId, "9007199254740993");
		assert.equal(transaction.source.toHexString(), source);
		assert.equal(transaction.balanceChange, `tx-${log}`);
		const balance = balances.get(transaction.balanceChange);
		assert.equal(balance.type, "BRIDGE");
		assert.equal(balance.account.toHexString(), "account");
		assert.equal(balance.amount, "1000000");
		assert.equal(balance.collateral, "token");
		assert.equal(balance.transaction.toHexString(), "tx");
		assert.equal(balance.bridgeAddress, undefined);
		assert.equal(balance.bridgeTransactionId, undefined);
	}
});

test("new records are wired for every ABI that emits them, before nullable entity lookups", () => {
	for (let v = 0; v <= 6; v++) {
		const deps = {
			...(v === 6 ? JSON.parse(read("perps/analytics/deps_symmio_0_8_5.json")) : {}),
			...JSON.parse(read(`perps/analytics/deps_symmio_0_8_${v}.json`)),
		};
		assert.equal(deps.LiquidationStart, undefined);
		assert.equal(deps.WithdrawFinalization, undefined);
		const entry = read(`perps/analytics/src_symmio_0_8_${v}.ts`);
		if (v > 0) assert.match(entry, /export function handleLiquidatePartyA\(/);
		else assert.doesNotMatch(entry, /export function handleLiquidatePartyA\(/, "do not add legacy v0.8.0 behavior for COTI");
		if (v >= 3) {
			assert.ok(deps.LiquidationDetail.includes("DeferredLiquidatePartyA"));
			assert.deepEqual(deps.BridgeTransaction, ["TransferToBridge"]);
		}
		if (v >= 5) {
			assert.deepEqual(deps.Quote, ["TradingFeeCharged"]);
			assert.deepEqual(deps.QuoteFeeHint, ["TradingFeeCharged"]);
			assert.ok(deps.WithdrawRequest.includes("WithdrawFinalized"));
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

test("analytics schema keeps liquidation, withdrawal, fee and bridge data on their owning models", () => {
	const schema = parse(read("perps/analytics/schema.graphql") + read("perps/common/models/Quote.graphql"));
	const models = new Map(schema.definitions.map(type => [type.name.value, type]));
	const field = (model, name) => models.get(model).fields.find(field => field.name.value === name);
	for (const removed of ["LiquidationStart", "WithdrawFinalization", "QuoteFeeTotals"]) assert.ok(!models.has(removed), removed);
	assert.ok(models.has("WithdrawFinalizationHint"), "preserve the pre-COTI helper model");
	assert.equal(field("QuoteEvent", "liquidationDetail"), undefined);
	assert.equal(field("LiquidationDetail", "positionEvents"), undefined);
	assert.equal(field("Quote", "liquidationDetail").type.name.value, "LiquidationDetail");
	assert.equal(field("LiquidationDetail", "quotes").directives[0].arguments[0].value.value, "liquidationDetail");
	for (const name of ["liquidationDetail", "liquidationId"]) assert.equal(field("LiquidationEvent", name).type.kind, "NonNullType");
	for (const name of ["bridgeAddress", "bridgeTransactionId"]) assert.equal(field("BalanceChange", name), undefined);
	assert.equal(field("BridgeTransaction", "balanceChange").type.type.name.value, "BalanceChange");
	for (const name of [
		"finalizedTransaction",
		"finalizedLogIndex",
		"finalizedBy",
		"finalizedTimestamp",
		"finalizedBlockNumber",
		"finalizedBalanceChange",
	])
		assert.ok(field("WithdrawRequest", name), name);
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
		"../../utils/explorerEvents": { consumeQuoteFeeHint() {} },
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
