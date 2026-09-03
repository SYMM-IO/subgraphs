import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(path, "utf8");
const baseConfig = JSON.parse(read("configs/perps/base.json"));
const coreAddress = "0x91cf2d8ed503ec52768999aa6d8dbea6e52dbe43";
// The first v0.8.5 diamond cut added both metadata setters in transaction
// 0x73d3bf5469003691f2c3488279f035dc6fe09b111c53771174fd230e6fbdc930.
const metadataUpgradeBlock = 46754528;

const coreSources = baseConfig.contracts.filter(contract => contract.abi === "symmio" && contract.address.toLowerCase() === coreAddress);

test("Base routes entity metadata events through the v0.8.5 Core source", () => {
	const source = coreSources.find(
		contract =>
			Number(contract.startBlock) <= metadataUpgradeBlock &&
			(contract.endBlock === undefined || metadataUpgradeBlock <= Number(contract.endBlock)),
	);

	assert.equal(source?.version, "0_8_5");
	assert.equal(source?.startBlock, String(metadataUpgradeBlock));

	const previousSource = coreSources.find(contract => contract.version === "0_8_4");
	assert.equal(previousSource?.endBlock, String(metadataUpgradeBlock - 1));
});

test("v0.8.5 analytics and events dependencies subscribe to SetEntityMetadata", () => {
	const analyticsDeps = JSON.parse(read("perps/common/deps_symmio_0_8_5.json"));
	const eventsDeps = JSON.parse(read("perps/events/deps_symmio_0_8_5.json"));
	const analyticsSource = read("perps/analytics/src_symmio_0_8_5.ts");
	const eventsSource = read("perps/events/src_symmio_0_8_5.ts");

	assert.ok(analyticsDeps.SymmioEntity.includes("SetEntityMetadata"));
	assert.ok(eventsDeps.SetEntityMetadata.includes("SetEntityMetadata"));
	assert.match(analyticsSource, /export function handleSetEntityMetadata/);
	assert.match(eventsSource, /export function handleSetEntityMetadata/);
});
