import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
