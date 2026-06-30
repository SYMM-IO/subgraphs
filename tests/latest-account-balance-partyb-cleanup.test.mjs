import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("perps/analytics/utils/latestAccountBalance.ts", "utf8");

test("PartyB counterparty buckets are cleared when bucket-specific balances are zero", () => {
	const partyBUpdate = source.slice(source.indexOf("export function updatePartyBLatestBalance"));
	const removalPredicate = partyBUpdate.slice(partyBUpdate.indexOf("if ("), partyBUpdate.indexOf('store.remove("LatestAccountBalance", id)'));

	assert.match(removalPredicate, /entity\.allocatedBalance\.isZero\(\)/);
	assert.match(removalPredicate, /entity\.lockedCva\.isZero\(\)/);
	assert.match(removalPredicate, /entity\.pendingLockedPartyBmm\.isZero\(\)/);
	assert.doesNotMatch(removalPredicate, /entity\.freeBalance\.isZero\(\)/);
});
