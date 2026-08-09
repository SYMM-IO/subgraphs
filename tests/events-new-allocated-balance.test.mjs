import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const versions = ["0_8_0", "0_8_1", "0_8_2", "0_8_3", "0_8_4", "0_8_5", "0_8_6"];
const handlers = [
	["AllocatePartyA", "perps/events/handlers/symmio/AllocatePartyAHandler.ts", 2],
	["DeallocatePartyA", "perps/events/handlers/symmio/DeallocatePartyAHandler.ts", 2],
	["AllocateForPartyB", "perps/events/handlers/symmio/AllocateForPartyBHandler.ts", 3],
	["DeallocateForPartyB", "perps/events/handlers/symmio/DeallocateForPartyBHandler.ts", 3],
];

function eventNewAllocatedBalanceIndex(eventName, version) {
	const abi = JSON.parse(readFileSync(`configs/abis/symmio_${version}.json`, "utf8"));
	const event = abi.find(entry => entry.type === "event" && entry.name === eventName);
	assert.ok(event, `${eventName} should exist in symmio_${version}`);
	return event.inputs.findIndex(input => input.name === "newAllocatedBalance");
}

test("events handlers read newAllocatedBalance for every ABI version that emits it", () => {
	for (const [eventName, handlerPath, parameterIndex] of handlers) {
		const handler = readFileSync(handlerPath, "utf8");
		for (const version of versions) {
			if (!existsSync(`perps/events/deps_symmio_${version}.json`)) continue;
			const abiParameterIndex = eventNewAllocatedBalanceIndex(eventName, version);
			if (abiParameterIndex === -1) continue;
			assert.equal(
				abiParameterIndex,
				parameterIndex,
				`${eventName}.newAllocatedBalance moved unexpectedly in symmio_${version}`,
			);
		}
		assert.match(handler, new RegExp(`_event\\.parameters\\.length >= ${parameterIndex + 1}`));
		assert.match(handler, new RegExp(`_event\\.parameters\\[${parameterIndex}\\]\\.value\\.toBigInt\\(\\)`));
	}
});
