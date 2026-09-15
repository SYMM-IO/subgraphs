import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { decodeLog, encodeEventSignature } from "web3-eth-abi";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
// BNB receipt, block 41788947, log 64. partyA is not indexed.
const receipt = {
	transaction: "0x6c8de748b04fb0b176624d94e191edf3f9cfbfc9f40335aad1c2948c2580bdd7",
	source: "0x9a9f48888600fc9c05f11e03eab575ebb2fc2c8f",
	partyA: "0xe0d3ca6abbfabd6f94cbecd19ab2a2efc724128a",
	topic: "0x6a4ef102cfba4a17a36d8734f7684b52fc844118a79fb1e2f5953d781c6436eb",
	data: "0x000000000000000000000000e0d3ca6abbfabd6f94cbecd19ab2a2efc724128a",
	liquidationId: "0x2e4b3a07cb775fe0767a706d4c8ea7d69aa4c4db05a209c1007e3c47a31bf6a1",
};

for (const version of ["0_8_1", "0_8_2"]) {
	test(`${version} ABI recognizes and decodes the captured BNB completion log`, () => {
		const abi = JSON.parse(read(`configs/abis/symmio_${version}.json`));
		const event = abi.find(entry => entry.type === "event" && encodeEventSignature(entry) === receipt.topic);
		assert.ok(event, "captured completion topic must be included in the ABI");
		assert.equal(event.name, "FullyLiquidatedPartyA");
		assert.deepEqual(
			event.inputs.map(({ name, type, indexed }) => ({ name, type, indexed })),
			[{ name: "partyA", type: "address", indexed: false }],
		);
		assert.equal(decodeLog(event.inputs, receipt.data, []).partyA.toLowerCase(), receipt.partyA);
	});
}

// Execute the actual handler and lifecycle utility bodies with mocked Graph host
// objects. Full graph builds separately validate AssemblyScript specialization.
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
	return new Function("require", "changetype", `${source}\nreturn {${exports.join(",")}};`)(
		name => {
			assert.ok(name in dependencies, `unexpected dependency ${name}`);
			return dependencies[name];
		},
		value => value,
	);
}

const bytes = value => ({ toHexString: () => value, toHex: () => value });
const Version = Object.fromEntries(Array.from({ length: 7 }, (_, version) => [`v_0_8_${version}`, version]));

function harness(version, { missingState = false } = {}) {
	const partyA = bytes(receipt.partyA);
	const liquidationId = bytes(receipt.liquidationId);
	const detailId = `${receipt.partyA}-${receipt.liquidationId}-${receipt.source}`;
	const detail = { settled: true, fullyLiquidated: false, involvedPartyBCounts: 1n, fullyLiquidatedTimestamp: null, save() {} };
	const events = new Map();
	const reconciliation = [];
	const schema = {
		LiquidationDetail: { load: id => (id === detailId ? detail : null) },
		LiquidationEvent: class {
			constructor(id) {
				this.id = id;
			}
			save() {
				events.set(this.id, this);
			}
		},
	};
	const loader = {
		getLiquidationStateData: () => {
			assert.ok(version < 3, "modern completion must use the event ID without a state call");
			return missingState ? null : { liquidationId };
		},
	};
	const common = loadSource("perps/common/handlers/symmio/FullyLiquidatedPartyAHandler.ts", {
		"../../BaseHandler": { Version, BaseHandler: class {} },
		"@graphprotocol/graph-ts": { BigInt: { zero: () => 0n } },
		"../../../../generated/schema": schema,
		"../../VersionedQuoteLoader": loader,
	});
	const lifecycle = loadSource("perps/analytics/utils/liquidationEvent.ts", {
		"@graphprotocol/graph-ts": {},
		"../../common/BaseHandler": { Version },
		"../../../generated/schema": schema,
		"../../common/VersionedQuoteLoader": loader,
		"../../common/utils": { getGlobalCounterAndInc: () => 1n },
	});
	const analytics = loadSource("perps/analytics/handlers/symmio/FullyLiquidatedPartyAHandler.ts", {
		"@graphprotocol/graph-ts": {},
		"../../../common/handlers/symmio/FullyLiquidatedPartyAHandler": common,
		"../../../common/BaseHandler": { Version },
		"../../utils/liquidationEvent": lifecycle,
		"../../utils/partyALiquidation": {
			reconcileCompletedPartyALiquidation: (source, account, id) => reconciliation.push(["reconcile", source, account, id]),
			clearPartyALiquidationTracking: (source, account) => reconciliation.push(["clear", source, account]),
		},
	});
	const event = {
		address: bytes(receipt.source),
		params: version >= 3 ? { partyA, liquidationId } : { partyA },
		parameters: [{ value: { toAddress: () => partyA } }],
		transaction: { hash: bytes(receipt.transaction), index: 28n },
		logIndex: 64n,
		block: { timestamp: 1724940788n, number: 41788947n, hash: bytes("0xe9f860ccbbca4a6d0a935d8ab641d8851d06167b53fd7321c9237b03895e1f88") },
	};
	if (version >= 3) event.parameters.push({ value: { toBytes: () => liquidationId } });
	return { handler: new analytics.FullyLiquidatedPartyAHandler(), detail, detailId, event, events, reconciliation };
}

for (const version of [1, 2, 3, 4, 5, 6]) {
	test(`v0.8.${version} completion updates the detail and creates the correctly scoped lifecycle event`, () => {
		const h = harness(version);
		h.handler.handle(h.event, version);
		assert.equal(h.detail.fullyLiquidated, true);
		assert.equal(h.detail.involvedPartyBCounts, 0n);
		assert.equal(h.detail.fullyLiquidatedTimestamp, 1724940788n);
		assert.equal(h.events.size, 1);
		const event = h.events.get(`${receipt.transaction}-64-FULLY_LIQUIDATED`);
		assert.equal(event.liquidationDetail, h.detailId);
		assert.equal(event.liquidationId.toHexString(), receipt.liquidationId);
		assert.equal(event.timestamp, 1724940788n);
		assert.deepEqual(
			h.reconciliation.map(call => call[0]),
			version === 6 ? ["reconcile", "clear"] : [],
		);
		if (version === 6) assert.equal(h.reconciliation[0][3].toHexString(), receipt.liquidationId);
	});
}

test("legacy unavailable state leaves the detail and lifecycle unchanged", () => {
	for (const version of [1, 2]) {
		const h = harness(version, { missingState: true });
		h.handler.handle(h.event, version);
		assert.equal(h.detail.fullyLiquidated, false);
		assert.equal(h.detail.fullyLiquidatedTimestamp, null);
		assert.equal(h.detail.involvedPartyBCounts, 1n);
		assert.equal(h.events.size, 0);
	}
});

test("raw legacy completion preserves the emitted payload without inventing a liquidation ID", () => {
	const stored = [];
	const raw = loadSource("perps/events/handlers/symmio/FullyLiquidatedPartyAHandler.ts", {
		"../../../common/BaseHandler": { Version },
		"../../../../generated/schema": {
			FullyLiquidatedPartyA: class {
				constructor(id) {
					this.id = id;
				}
				save() {
					stored.push(this);
				}
			},
		},
		"@graphprotocol/graph-ts": { Bytes: { empty: () => bytes("0x") } },
		"../../../common/utils": { getGlobalCounterAndInc: () => 1n },
	});
	new raw.FullyLiquidatedPartyAHandler().handle(harness(2).event, 2);
	assert.equal(stored[0].id, `${receipt.transaction}-64`);
	assert.equal(stored[0].partyA.toHexString(), receipt.partyA);
	assert.equal(stored[0].liquidationId.toHexString(), "0x");
	assert.equal(stored[0].blockTimestamp, 1724940788n);
});

test("generic completion does not access a field absent from legacy generated types", () => {
	assert.doesNotMatch(read("perps/analytics/handlers/symmio/FullyLiquidatedPartyAHandler.ts"), /event\.params\.liquidationId/);
});

test("settlement handlers do not promote a settlement event to full completion", () => {
	assert.doesNotMatch(read("perps/common/handlers/symmio/SettlePartyALiquidationHandler.ts"), /\.fullyLiquidated\s*=/);
	assert.doesNotMatch(read("perps/analytics/handlers/symmio/SettlePartyALiquidationHandler.ts"), /FULLY_LIQUIDATED/);
});
