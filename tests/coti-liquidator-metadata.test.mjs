import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

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
		assert.deepEqual(JSON.parse(row.metadata), { amount: "2", openedPrice: "4", closePrice: "3", liquidator: "batch-executor" });
	}
	assert.deepEqual(JSON.parse(rows[2].metadata), { amount: "2", openedPrice: "4", closePrice: "3" });
});
