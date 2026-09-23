import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { parse, print } from "graphql";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const core = `0x${"11".repeat(20)}`;
const otherCore = `0x${"22".repeat(20)}`;
const receiver = `0x${"33".repeat(20)}`;
const tag = `0x${"01".repeat(32)}`;
const otherTag = `0x${"02".repeat(32)}`;
const bytes = value => ({ toHexString: () => value });
const integer = value => ({
	value: BigInt(value),
	toString() {
		return this.value.toString();
	},
	plus(other) {
		return integer(this.value + other.value);
	},
});

// Run the actual AssemblyScript handler with Graph host objects mocked, as in
// legacy-liquidation-completion.test.mjs. Graph build validates its AS types.
function harness() {
	const quotes = new Map();
	const fees = new Map();
	const refreshes = [];
	const warnings = [];
	class QuoteSolverFee {
		constructor(id) {
			this.id = id;
		}
		static load(id) {
			const saved = fees.get(id);
			return saved ? Object.assign(new QuoteSolverFee(id), saved) : null;
		}
		save() {
			fees.set(this.id, { ...this });
		}
	}
	const dependencies = {
		"@graphprotocol/graph-ts": {
			BigInt: { zero: () => integer(0) },
			log: { warning: (message, values) => warnings.push([message, values]) },
		},
		"../../../../generated/schema": { Quote: { load: id => quotes.get(id) ?? null }, QuoteSolverFee },
		"../../../common/BaseHandler": { BaseHandler: class {} },
		"../../utils/latestAccountBalance": {
			updatePartyALatestBalance: (event, version, account) => refreshes.push({ event, version, account }),
		},
	};
	const source = stripTypeScriptTypes(read("perps/analytics/handlers/symmio/SolverFeeChargedHandler.ts"))
		.replace(
			/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g,
			(_, bindings, module) => `const {${bindings}} = require(${JSON.stringify(module)});`,
		)
		.replace("export class SolverFeeChargedHandler", "class SolverFeeChargedHandler");
	const Handler = new Function("require", "changetype", `${source}\nreturn SolverFeeChargedHandler;`)(
		name => {
			assert.ok(name in dependencies, `unexpected dependency ${name}`);
			return dependencies[name];
		},
		value => value,
	);
	const handler = new Handler();
	return {
		fees,
		refreshes,
		warnings,
		addQuote(quoteId = 1, source = core) {
			const id = `${quoteId}-${source}`;
			quotes.set(id, { id });
			return id;
		},
		charge({ quoteId = 1, source = core, feeTag = tag, feeType = 0, amount = "100000000000000000", to = receiver } = {}) {
			const event = {
				address: bytes(source),
				params: { quoteId: integer(quoteId), tag: bytes(feeTag), feeType, amount: integer(amount), receiver: bytes(to) },
			};
			handler.handle(event, 6);
			return event;
		},
	};
}

test("creates a quote-tag summary with exact opening amount and zero closing amount", () => {
	const h = harness();
	const quoteId = h.addQuote();
	const event = h.charge({ amount: "123456789012345678901234567890" });
	const fee = h.fees.get(`${quoteId}-${tag}`);
	assert.equal(h.fees.size, 1);
	assert.equal(fee.quote, quoteId);
	assert.equal(fee.tag.toHexString(), tag);
	assert.equal(fee.openFeePaid.value, 123456789012345678901234567890n);
	assert.equal(fee.closeFeePaid.value, 0n);
	assert.deepEqual(h.refreshes, [{ event, version: 6, account: event.params.receiver }]);
});

test("sums repeated opening entries and partial closes across receivers into one quote-tag summary", () => {
	const h = harness();
	const quoteId = h.addQuote();
	h.charge();
	h.charge({ amount: "200000000000000000", to: `0x${"44".repeat(20)}` });
	h.charge({ feeType: 1, amount: "30000000000000000" });
	h.charge({ feeType: 1, amount: "70000000000000000" });
	const fee = h.fees.get(`${quoteId}-${tag}`);
	assert.equal(h.fees.size, 1);
	assert.equal(fee.openFeePaid.value, 300000000000000000n);
	assert.equal(fee.closeFeePaid.value, 100000000000000000n);
	assert.equal(h.refreshes.length, 4);
	assert.equal(h.warnings.length, 0);
});

test("isolates tags, Core contracts, and quote ids including partial-open remainder quotes", () => {
	const h = harness();
	const parentId = h.addQuote();
	const childId = h.addQuote(2);
	const otherCoreId = h.addQuote(1, otherCore);
	h.charge({ amount: "11" });
	h.charge({ feeTag: otherTag, amount: "22" });
	h.charge({ source: otherCore, amount: "33" });
	assert.equal(h.fees.has(`${childId}-${tag}`), false, "a new quote must not inherit another quote's paid fees");
	h.charge({ quoteId: 2, amount: "44" });
	assert.equal(h.fees.size, 4);
	assert.equal(h.fees.get(`${parentId}-${tag}`).openFeePaid.value, 11n);
	assert.equal(h.fees.get(`${parentId}-${otherTag}`).openFeePaid.value, 22n);
	assert.equal(h.fees.get(`${otherCoreId}-${tag}`).openFeePaid.value, 33n);
	assert.equal(h.fees.get(`${childId}-${tag}`).openFeePaid.value, 44n);
});

test("creates a closing-only summary and preserves a zero bytes32 tag", () => {
	const h = harness();
	const quoteId = h.addQuote();
	const zeroTag = `0x${"00".repeat(32)}`;
	h.charge({ feeType: 1, feeTag: zeroTag });
	const fee = h.fees.get(`${quoteId}-${zeroTag}`);
	assert.equal(fee.tag.toHexString(), zeroTag);
	assert.equal(fee.openFeePaid.value, 0n);
	assert.equal(fee.closeFeePaid.value, 100000000000000000n);
});

test("missing Quote logs a coverage gap without creating a dangling summary or skipping the balance refresh", () => {
	const h = harness();
	h.charge();
	assert.equal(h.fees.size, 0);
	assert.equal(h.refreshes.length, 1);
	assert.match(h.warnings[0][0], /quote.*not indexed/);
});

test("unsupported fee types do not create a summary or get counted as closing fees", () => {
	const h = harness();
	const quoteId = h.addQuote();
	h.charge({ feeType: 2 });
	assert.equal(h.fees.size, 0);
	h.charge();
	h.charge({ feeType: 255 });
	assert.equal(h.fees.size, 1);
	assert.equal(h.fees.get(`${quoteId}-${tag}`).openFeePaid.value, 100000000000000000n);
	assert.equal(h.fees.get(`${quoteId}-${tag}`).closeFeePaid.value, 0n);
	assert.equal(h.warnings.length, 2);
	assert.equal(h.refreshes.length, 3);
});

test("the public schema exposes mutable summaries through a derived Quote relation and indexes the tagged fee event", () => {
	const analytics = parse(read("perps/analytics/schema.graphql"));
	const fee = analytics.definitions.find(type => type.name?.value === "QuoteSolverFee");
	const entity = fee.directives.find(directive => directive.name.value === "entity");
	assert.equal(entity.arguments.find(argument => argument.name.value === "immutable").value.value, false);
	assert.deepEqual(Object.fromEntries(fee.fields.map(field => [field.name.value, print(field.type)])), {
		id: "ID!",
		quote: "Quote!",
		tag: "Bytes!",
		openFeePaid: "BigInt!",
		closeFeePaid: "BigInt!",
	});
	const quote = parse(read("perps/common/models/Quote.graphql")).definitions.find(type => type.name?.value === "Quote");
	const relation = quote.fields.find(field => field.name.value === "solverFees");
	assert.equal(print(relation.type), "[QuoteSolverFee!]!");
	assert.equal(relation.directives[0].name.value, "derivedFrom");
	assert.equal(relation.directives[0].arguments[0].value.value, "quote");
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_6.json"));
	assert.deepEqual(deps.QuoteSolverFee, ["SolverFeeCharged(uint256,address,address,address,uint256,uint8,uint256,bytes32)"]);
	assert.ok(deps.LatestAccountBalance.includes(deps.QuoteSolverFee[0]), "retain receiver balance indexing");
});
