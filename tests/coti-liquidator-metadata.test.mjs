import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("COTI preserves the on-chain v0.8.5 upgrade boundary and required ABI bindings", () => {
	// The first v0.8.5 DiamondCut is in transaction
	// 0x11d5cf40a8c5322010d6777de73d248edfcd36656fbd5fb9508002c3474a1f84.
	// The second cut at 7316439 only adds remaining selectors; no trading logs
	// occur between the two cuts. Keep endBlock inclusive and non-overlapping.
	const config = JSON.parse(read("configs/perps/coti.json"));
	const cores = config.contracts.filter(contract => contract.abi === "symmio");
	assert.equal(cores.length, 2);
	const current = cores.find(contract => contract.version === "0_8_5");
	const previous = cores.find(contract => contract.version === "0_8_4");
	assert.equal(current.startBlock, "7316419");
	assert.equal(current.endBlock, undefined);
	assert.equal(previous.startBlock, "185858");
	assert.equal(previous.endBlock, "7316418");
	for (const core of cores) {
		assert.equal(core.address.toLowerCase(), "0x2ecc7da3cc98d341f987c85c3d9fc198570838b5");
		assert.deepEqual(core.dependencies, ["feeCollector_1", "symmioMultiAccount_2"]);
	}
});

test("COTI v0.8.4 quote liquidation carries the batch executor, not the starter", () => {
	const abi = JSON.parse(read("configs/abis/symmio_0_8_4.json"));
	const event = abi.find(item => item.type === "event" && item.name === "LiquidatePositionsPartyA");
	assert.ok(event.inputs.some(input => input.name === "liquidator" && input.type === "address"));
	const caller = read("perps/analytics/handlers/symmio/LiquidatePositionsPartyAHandler.ts");
	assert.match(
		caller,
		/handleLiquidatePosition<T>\(_event, version, quoteId, "LIQUIDATE_PARTY_A", fundingContexts\[i\], fundingOverride, event.params.liquidator\)/,
	);
	const helper = read("perps/analytics/handlers/commonHandlers/liquidatePositions.ts");
	assert.match(helper, /liquidator: Address \| null = null/);
	assert.match(helper, /if \(liquidator !== null\) metadata.add\("liquidator", liquidator.toHexString\(\)\)/);
	assert.match(helper, /createQuoteEvent\([\s\S]*?metadata.build\(\)/);
});

// Execute the actual mapping bodies with Graph host stubs, as in the existing
// release-compatibility tests. The COTI graph build checks AssemblyScript types.
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

test("liquidation quote events serialize each batch executor and retain per-quote IDs", () => {
	const rows = [];
	const number = value => ({
		toString: () => String(value),
		times: other => number(value * Number(other.toString())),
		div: other => number(value / Number(other.toString())),
		pow: exponent => number(value ** exponent),
	});
	const bytes = value => ({ toHexString: () => value });
	const source = bytes("core"),
		executor = bytes("batch-executor");
	const quote = {
		liquidationId: bytes("liquidation"),
		liquidateAmount: number(2),
		liquidatePrice: number(3),
		partyA: bytes("a"),
		partyB: bytes("b"),
		symbolId: number(1),
		positionType: 0,
		openedPrice: number(4),
		initialOpenedPrice: number(4),
	};
	const schema = {
		Quote: { load: () => quote },
		Account: { load: () => null },
		QuoteEvent: class {
			constructor(id) {
				this.id = id;
			}
			save() {
				rows.push(this);
			}
		},
	};
	const graph = { BigInt: { fromString: value => number(Number(value)), zero: () => number(0) } };
	const quoteEvents = loadSource("perps/analytics/utils/quoteEvent.ts", {
		"@graphprotocol/graph-ts": graph,
		"../../../generated/schema": schema,
		"../../common/utils": { getGlobalCounterAndInc: () => number(rows.length) },
	});
	const mapping = loadSource("perps/analytics/handlers/commonHandlers/liquidatePositions.ts", {
		"@graphprotocol/graph-ts/chain/ethereum": {},
		"@graphprotocol/graph-ts": graph,
		"../../../common/BaseHandler": { Version: { v_0_8_5: 5 } },
		"../../../../generated/schema": schema,
		"../../utils/historyHelpers": {},
		"../../utils/openInterestHelpers": {},
		"../../utils/common": {},
		"../../utils/quoteEvent": quoteEvents,
		"../../utils/aggregatedPosition": { onFundingSettlementAndPositionClose() {} },
		"../../utils/fundingFeeState": {},
		"../../utils/fundingHistory": {},
	});
	const event = { address: source, transaction: { hash: bytes("tx") }, logIndex: number(9), block: { timestamp: number(10), number: number(100) } };
	for (const id of [21, 22]) mapping.handleLiquidatePosition(event, 4, number(id), "LIQUIDATE_PARTY_A", null, null, executor);
	mapping.handleLiquidatePosition(event, 4, number(23), "LIQUIDATE_PARTY_B", null, null);
	assert.deepEqual(
		rows.map(row => row.id),
		["tx-9-21", "tx-9-22", "tx-9-23"],
	);
	for (const row of rows.slice(0, 2)) {
		assert.equal(row.liquidationDetail, "a-liquidation-core");
		assert.deepEqual(JSON.parse(row.metadata), { amount: "2", openedPrice: "4", closePrice: "3", liquidator: "batch-executor" });
	}
	assert.deepEqual(JSON.parse(rows[2].metadata), { amount: "2", openedPrice: "4", closePrice: "3" });
	assert.equal(rows[2].liquidationDetail, undefined);
	quote.liquidationId = null;
	mapping.handleLiquidatePosition(event, 0, number(24), "LIQUIDATE_PARTY_A", null, null, executor);
	assert.equal(rows[3].liquidationDetail, undefined, "old unknown protocol IDs must not create invented relations");
});
