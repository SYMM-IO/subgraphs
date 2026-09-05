import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(path, "utf8");
const baseConfig = JSON.parse(read("configs/perps/base.json"));
const coreAddress = "0x91cf2d8ed503ec52768999aa6d8dbea6e52dbe43";
const accountLayerAddress = "0x56caf00c6c5cb5478570bb23807b9d1d697863dc";
// The production Account Layer was created in transaction
// 0x015ddf597ab3520fde92f9f69c8b8091d53ab596c4e3d29c29e8324198ad9b0d.
const accountLayerDeploymentBlock = 45290554;

test("Base indexes the production Account Layer with its deployed event surface", () => {
	const accountLayerSources = baseConfig.contracts.filter(contract => contract.abi === "accountLayer");

	assert.equal(accountLayerSources.length, 1);
	assert.equal(accountLayerSources[0].address.toLowerCase(), accountLayerAddress);
	assert.equal(accountLayerSources[0].version, "2");
	assert.equal(accountLayerSources[0].startBlock, String(accountLayerDeploymentBlock));

	const analyticsSource = read("perps/analytics/src_accountLayer_2.ts");
	const eventsDeps = JSON.parse(read("perps/events/deps_accountLayer_2.json"));
	const eventsSource = read("perps/events/src_accountLayer_2.ts");
	assert.match(analyticsSource, /export function handleSubAccountCreated/);
	assert.ok(eventsDeps.SymmioCoreAddedToAffiliate.includes("SymmioCoreAddedToAffiliate"));
	assert.match(eventsSource, /export function handleSymmioCoreAddedToAffiliate/);
});

test("Base scopes Account Layer context to the paired v0.8.5 Core source", () => {
	const pairedCore = baseConfig.contracts.find(
		contract => contract.abi === "symmio" && contract.version === "0_8_5" && contract.address.toLowerCase() === coreAddress,
	);
	assert.equal(pairedCore?.accountLayerSource.toLowerCase(), accountLayerAddress);

	const unrelatedSources = baseConfig.contracts.filter(contract => contract !== pairedCore && contract.abi !== "accountLayer");
	assert.ok(unrelatedSources.every(contract => contract.accountLayerSource === undefined));
});
