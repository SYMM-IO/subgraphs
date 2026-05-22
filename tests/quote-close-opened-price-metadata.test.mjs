import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("actual close quote events include openedPrice in metadata", () => {
	const closeHandler = read("perps/analytics/handlers/commonHandlers/close.ts");
	const liquidationHandler = read("perps/analytics/handlers/commonHandlers/liquidatePositions.ts");
	const adlCloseHandler = read("perps/analytics/handlers/symmio/ADLCloseHandler.ts");

	assert.match(
		closeHandler,
		/\.add\("openedPrice", quote\.openedPrice!\.toString\(\)\)/,
		"fill/force/emergency close metadata must snapshot openedPrice",
	);
	assert.match(
		liquidationHandler,
		/\.add\("openedPrice", quote\.openedPrice!\.toString\(\)\)/,
		"liquidation close metadata must snapshot openedPrice",
	);
	assert.match(
		adlCloseHandler,
		/\.add\("openedPrice", quote\.openedPrice!\.toString\(\)\)/,
		"ADL close metadata must snapshot openedPrice",
	);
});
