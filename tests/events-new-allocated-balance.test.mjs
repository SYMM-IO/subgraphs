import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const versions = ["0_8_0", "0_8_1", "0_8_2", "0_8_3", "0_8_4", "0_8_5", "0_8_6"];
const handlers = [
	["AllocatePartyA", "perps/events/handlers/symmio/AllocatePartyAHandler.ts"],
	["DeallocatePartyA", "perps/events/handlers/symmio/DeallocatePartyAHandler.ts"],
	["AllocateForPartyB", "perps/events/handlers/symmio/AllocateForPartyBHandler.ts"],
	["DeallocateForPartyB", "perps/events/handlers/symmio/DeallocateForPartyBHandler.ts"],
];

function eventHasNewAllocatedBalance(eventName, version) {
	const abi = JSON.parse(readFileSync(`configs/abis/symmio_${version}.json`, "utf8"));
	const event = abi.find(entry => entry.type === "event" && entry.name === eventName);
	assert.ok(event, `${eventName} should exist in symmio_${version}`);
	return event.inputs.some(input => input.name === "newAllocatedBalance");
}

test("events handlers read newAllocatedBalance for every ABI version that emits it", () => {
	for (const [eventName, handlerPath] of handlers) {
		const handler = readFileSync(handlerPath, "utf8");
		for (const version of versions) {
			if (!existsSync(`perps/events/deps_symmio_${version}.json`)) continue;
			if (!eventHasNewAllocatedBalance(eventName, version)) continue;
			assert.match(
				handler,
				new RegExp(`Version\\.v_${version}`),
				`${handlerPath} should handle ${eventName}.newAllocatedBalance for ${version}`,
			);
			assert.match(handler, new RegExp(`${eventName}_0_${version.slice(2)}`), `${handlerPath} should cast ${eventName} for ${version}`);
		}
	}
});
