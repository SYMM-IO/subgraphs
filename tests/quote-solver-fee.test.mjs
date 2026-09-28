import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { parse } from "graphql";
import { decodeParameter, encodeParameters, encodeEventSignature } from "web3-eth-abi";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const abi = JSON.parse(read("configs/abis/symmio_0_8_6.json"));
const eventAbi = (name, count) => abi.find(entry => entry.type === "event" && entry.name === name && entry.inputs.length === count);
const feeAbi = eventAbi("SolverFeeCharged", 8);
const closeAbi = eventAbi("FillCloseRequest", 7);
const core = `0x${"11".repeat(20)}`;
const otherCore = `0x${"22".repeat(20)}`;
const receiver = `0x${"33".repeat(20)}`;
const tag = `0x${"01".repeat(32)}`;
const otherTag = `0x${"02".repeat(32)}`;
const staticTag = `0x${Buffer.from("STATIC_SOLVER_FEE").toString("hex").padEnd(64, "0")}`;
const variableTag = `0x${Buffer.from("SOLVER_FEE").toString("hex").padEnd(64, "0")}`;
const Version = Object.fromEntries(Array.from({ length: 7 }, (_, version) => [`v_0_8_${version}`, version]));

class Bytes extends Uint8Array {
	static fromUint8Array(value) {
		return new Bytes(value);
	}
	toHexString() {
		return `0x${Buffer.from(this).toString("hex")}`;
	}
	equals(other) {
		return this.toHexString() === other.toHexString();
	}
}
const bytes = value => new Bytes(Buffer.from(value.slice(2), "hex"));
const integer = value => ({
	value: BigInt(value),
	toString() {
		return this.value.toString();
	},
	plus(other) {
		return integer(this.value + other.value);
	},
	times(other) {
		return integer(this.value * other.value);
	},
	div(other) {
		return integer(this.value / other.value);
	},
	pow(exponent) {
		return integer(this.value ** BigInt(exponent));
	},
	lt(other) {
		return this.value < other.value;
	},
	equals(other) {
		return this.value === other.value;
	},
});
const graphValue = value => ({
	toBigInt: () => integer(value),
	toI32: () => Number(value),
	toTuple: () => Array.from({ length: 5 }, (_, index) => graphValue(value[index])),
});
const graph = {
	Bytes,
	BigInt: { fromString: integer, zero: () => integer(0) },
	ethereum: {
		decode(type, data) {
			try {
				return graphValue(decodeParameter(type, data.toHexString()));
			} catch {
				return null;
			}
		},
	},
	log: { debug() {} },
};

// Execute the actual AssemblyScript bodies against ABI-encoded logs. Graph build
// separately checks AssemblyScript types and specialization of the real handlers.
function loadSource(path, dependencies) {
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
	return new Function("require", "changetype", "assert", `${source}\nreturn {${exports.join(",")}};`)(
		name => {
			assert.ok(name in dependencies, `unexpected dependency ${name}`);
			return dependencies[name];
		},
		value => value,
		assert.ok,
	);
}
const { solverFeeMetadata } = loadSource("perps/analytics/utils/solverFeeMetadata.ts", {
	"@graphprotocol/graph-ts": graph,
	"../../common/BaseHandler": { Version },
});
function log(event, values, source = core) {
	const inputs = event.inputs.filter(input => !input.indexed);
	return {
		address: bytes(source),
		topics: [
			bytes(encodeEventSignature(event)),
			...event.inputs.filter(input => input.indexed).map(input => bytes(encodeParameters([input], [values[input.name]]))),
		],
		data: bytes(
			encodeParameters(
				inputs,
				inputs.map(input => values[input.name]),
			),
		),
	};
}
function fee({ quoteId = 1, source = core, feeTag = tag, feeType = 1, amount = "100000000000000000", to = receiver } = {}) {
	return log(feeAbi, { quoteId, partyA: receiver, partyB: receiver, receiver: to, symbolId: 1, feeType, amount, tag: feeTag }, source);
}
function execution(feeType = 1, { quoteId = 1, source = core, duplicate = false } = {}) {
	const definition = feeType === 0 ? eventAbi("OpenPosition", duplicate ? 6 : 5) : eventAbi("FillCloseRequest", duplicate ? 8 : 7);
	return log(
		definition,
		{
			quoteId,
			partyA: receiver,
			partyB: receiver,
			filledAmount: 100,
			openedPrice: 200,
			closedPrice: 210,
			quoteStatus: 6,
			closeId: 1,
			lockedValues: [0, 0, 0, 0],
		},
		source,
	);
}
function eventAt(entries, index) {
	const logs = entries.map((entry, offset) => ({ ...entry, logIndex: entry.logIndex ?? integer(100 + offset) }));
	return {
		...logs[index],
		receipt: { logs },
		transaction: { hash: bytes(`0x${"aa".repeat(32)}`) },
		block: { timestamp: integer(1), number: integer(1) },
	};
}
const pairs = (entries, index, feeType = 1, quoteId = 1) => JSON.parse(solverFeeMetadata(eventAt(entries, index), integer(quoteId), 6, feeType));

function lifecycleHarness() {
	const saved = [];
	const schema = {
		QuoteEvent: class {
			constructor(id) {
				this.id = id;
			}
			save() {
				saved.push(this);
			}
		},
		Quote: { load: () => ({ quoteStatus: 6, openedPrice: null }) },
		DebugEntity: class {
			save() {}
		},
	};
	const lifecycle = loadSource("perps/analytics/utils/quoteEvent.ts", {
		"@graphprotocol/graph-ts": graph,
		"../../../generated/schema": schema,
		"../../common/utils": { getGlobalCounterAndInc: () => integer(saved.length + 1) },
	});
	const { handleClose } = loadSource("perps/analytics/handlers/commonHandlers/close.ts", {
		"@graphprotocol/graph-ts": graph,
		"../../../../generated/schema": schema,
		"../../../common/BaseHandler": { Version },
		"../../utils/historyHelpers": {},
		"../../utils/openInterestHelpers": {},
		"../../utils/common": {},
		"../../utils/quoteEvent": lifecycle,
		"../../utils/aggregatedPosition": {},
		"../../utils/fundingFeeState": {},
		"../../utils/fundingHistory": {},
		"../../utils/solverFeeMetadata": { solverFeeMetadata },
	});
	return {
		...lifecycle,
		saved,
		close(event, version = 6, type = "FILL_CLOSE", quoteId = 1) {
			event.params = { quoteId: integer(quoteId), filledAmount: integer(100), closedPrice: integer(210) };
			handleClose(event, "FillCloseRequest", version, type, null);
		},
	};
}

test("three captured Arbitrum partial closes each store their own fixed and variable fees in metadata", () => {
	// Public Arbitrum receipts: quote 172, blocks 508081880 / 508082062 / 508082437.
	// Fixture keeps fee logs and both close overloads; unrelated logs are omitted.
	const receipts = JSON.parse(read("tests/fixtures/solver-fee-partial-close-receipts.json"));
	const variable = ["7141124191108907", "913293400380899", "355300726750199"];
	const h = lifecycleHarness();
	for (const [index, receipt] of receipts.entries()) {
		const logs = receipt.logs.map(entry => ({
			address: bytes(entry.address),
			topics: entry.topics.map(bytes),
			data: bytes(entry.data),
			logIndex: integer(entry.logIndex),
		}));
		const trigger = logs.findIndex(entry => entry.topics[0].toHexString() === encodeEventSignature(closeAbi));
		const event = eventAt(logs, trigger);
		event.transaction.hash = bytes(receipt.transactionHash);
		h.close(event, 6, "FILL_CLOSE", 172);
		const metadata = JSON.parse(h.saved[index].metadata);
		assert.deepEqual(metadata.solverFees, [
			[variableTag, variable[index]],
			[staticTag, "100000000000000000"],
		]);
		assert.equal(metadata.amount, "100");
		assert.equal(metadata.closePrice, "210");
	}
	assert.equal(h.saved.length, 3, "one immutable event write per execution, no later fee updates");
	assert.equal(new Set(h.saved.map(row => row.id)).size, 3);
});

test("multiple closes of one quote in a transaction have disjoint fee windows, including a fee-less close", () => {
	const logs = [
		fee(),
		execution(),
		execution(1, { duplicate: true }),
		fee({ amount: "200000000000000000" }),
		execution(),
		execution(1, { duplicate: true }),
		execution(),
	];
	assert.deepEqual(pairs(logs, 1), [[tag, "100000000000000000"]]);
	assert.deepEqual(pairs(logs, 4), [[tag, "200000000000000000"]]);
	assert.deepEqual(pairs(logs, 6), []);
});

test("opening fees emitted after the execution ignore duplicate logs and stop at the next opening", () => {
	const logs = [execution(0), execution(0, { duplicate: true }), fee({ feeType: 0, amount: "7" }), execution(0), fee({ feeType: 0, amount: "9" })];
	assert.deepEqual(pairs(logs, 0, 0), [[tag, "7"]]);
	assert.deepEqual(pairs(logs, 3, 0), [[tag, "9"]]);
});

test("receipt scanning isolates quote, source, fee type and tags with interleaved executions", () => {
	const logs = [
		execution(0),
		fee({ feeType: 0, amount: "7" }),
		fee({ amount: "8" }),
		fee({ feeTag: otherTag, amount: "9" }),
		fee({ quoteId: 2, amount: "88" }),
		execution(1, { quoteId: 2 }),
		fee({ source: otherCore, amount: "99" }),
		execution(1, { source: otherCore }),
		fee({ feeType: 255, amount: "77" }),
		execution(),
	];
	assert.deepEqual(pairs(logs, 0, 0), [[tag, "7"]]);
	assert.deepEqual(pairs(logs, 9), [
		[tag, "8"],
		[otherTag, "9"],
	]);
	assert.deepEqual(pairs(logs, 5, 1, 2), [[tag, "88"]]);
	assert.deepEqual(pairs(logs, 7), [[tag, "99"]]);
});

test("fees sharing a raw tag sum exactly across receivers within the execution", () => {
	const zeroTag = `0x${"00".repeat(32)}`;
	const logs = [
		fee({ feeTag: zeroTag, amount: "123456789012345678901234567890" }),
		fee({ feeTag: zeroTag, amount: "11", to: otherCore }),
		execution(),
	];
	assert.deepEqual(pairs(logs, 2), [[zeroTag, "123456789012345678901234567901"]]);
});

test("known fee-less executions have an empty array; legacy and unrelated lifecycle events omit the field", () => {
	assert.deepEqual(pairs([execution()], 0), []);
	const h = lifecycleHarness();
	const legacyEvent = eventAt([execution()], 0);
	legacyEvent.receipt = null;
	for (const version of [0, 1, 2, 3, 4, 5]) {
		h.close(legacyEvent, version);
		assert.equal(Object.hasOwn(JSON.parse(h.saved.at(-1).metadata), "solverFees"), false);
	}
	h.close(legacyEvent, 6, "FORCE_CLOSE");
	assert.equal(Object.hasOwn(JSON.parse(h.saved.at(-1).metadata), "solverFees"), false);
});

test("missing receipts, execution boundaries, or malformed fee data fail instead of reporting zero", () => {
	const event = eventAt([execution()], 0);
	assert.throws(() => solverFeeMetadata({ ...event, receipt: null }, integer(1), 6, 1), /receipt required/);
	assert.throws(() => solverFeeMetadata(event, integer(2), 6, 1), /execution missing/);
	const broken = fee();
	broken.data = bytes("0x00");
	assert.throws(() => pairs([broken, execution()], 1), /invalid fee data/);
});

test("fee balance refresh remains even without a Quote entity", () => {
	const refreshes = [];
	const { SolverFeeChargedHandler } = loadSource("perps/analytics/handlers/symmio/SolverFeeChargedHandler.ts", {
		"@graphprotocol/graph-ts": graph,
		"../../../common/BaseHandler": { BaseHandler: class {}, Version },
		"../../utils/latestAccountBalance": { updatePartyALatestBalance: (...args) => refreshes.push(args) },
	});
	const event = { params: { receiver: bytes(receiver) } };
	new SolverFeeChargedHandler().handle(event, 6);
	assert.deepEqual(refreshes, [[event, 6, event.params.receiver]]);
});

test("schema retains immutable QuoteEvent metadata and removes cumulative fee entity and relation", () => {
	const analytics = parse(read("perps/analytics/schema.graphql"));
	assert.equal(
		analytics.definitions.some(type => type.name?.value === "QuoteSolverFee"),
		false,
	);
	const event = analytics.definitions.find(type => type.name?.value === "QuoteEvent");
	const entity = event.directives.find(directive => directive.name.value === "entity");
	assert.equal(entity.arguments.find(argument => argument.name.value === "immutable").value.value, true);
	assert.equal(event.fields.find(field => field.name.value === "metadata").type.name.value, "String");
	const quote = parse(read("perps/common/models/Quote.graphql")).definitions.find(type => type.name?.value === "Quote");
	assert.equal(
		quote.fields.some(field => field.name.value === "solverFees"),
		false,
	);
	const deps = JSON.parse(read("perps/analytics/deps_symmio_0_8_6.json"));
	assert.equal(Object.hasOwn(deps, "QuoteSolverFee"), false);
	assert.ok(deps.LatestAccountBalance.includes("SolverFeeCharged(uint256,address,address,address,uint256,uint8,uint256,bytes32)"));
});
