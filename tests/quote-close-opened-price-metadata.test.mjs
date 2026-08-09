import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("actual close quote events include openedPrice in metadata", () => {
	const closeHandler = read("perps/analytics/handlers/commonHandlers/close.ts");
	const liquidationHandler = read("perps/analytics/handlers/commonHandlers/liquidatePositions.ts");
	const adlCloseHandler = read("perps/analytics/handlers/symmio/ADLCloseHandler.ts");

	// openedPrice is snapshotted null-safely: force-unwrapping a null openedPrice aborts the
	// whole mapping in graph-ts, so metadata either uses addNullable or sits behind a null guard.
	assert.match(
		closeHandler,
		/\.addNullable\("openedPrice", quote\.openedPrice === null \? null : quote\.openedPrice!\.toString\(\)\)/,
		"fill/force/emergency close metadata must snapshot openedPrice null-safely",
	);
	assert.match(
		liquidationHandler,
		/quote\.openedPrice === null/,
		"liquidation close must guard null openedPrice before snapshotting",
	);
	assert.match(
		liquidationHandler,
		/\.add\("openedPrice", quote\.openedPrice!\.toString\(\)\)/,
		"liquidation close metadata must snapshot openedPrice",
	);
	assert.match(
		adlCloseHandler,
		/\.addNullable\("openedPrice", quote\.openedPrice === null \? null : quote\.openedPrice!\.toString\(\)\)/,
		"ADL close metadata must snapshot openedPrice null-safely",
	);
});
