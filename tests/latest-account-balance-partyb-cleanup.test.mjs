import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("perps/analytics/utils/latestAccountBalance.ts", "utf8");
const schema = readFileSync("perps/analytics/schema.graphql", "utf8");
const manager = readFileSync("scripts/manager.py", "utf8");

test("PartyB counterparty buckets are cleared when bucket-specific balances are zero", () => {
	const partyBUpdate = source.slice(source.indexOf("export function updatePartyBLatestBalance"));
	const removalPredicate = partyBUpdate.slice(partyBUpdate.indexOf("if ("), partyBUpdate.indexOf('store.remove("LatestAccountBalance", id)'));

	assert.match(removalPredicate, /entity\.allocatedBalance\.isZero\(\)/);
	assert.match(removalPredicate, /entity\.lockedCva\.isZero\(\)/);
	assert.match(removalPredicate, /entity\.pendingLockedPartyBmm\.isZero\(\)/);
	assert.doesNotMatch(removalPredicate, /entity\.freeBalance\.isZero\(\)/);
});

test("later same-transaction removals guard against older out-of-order balance writes", () => {
	const partyAUpdate = source.slice(source.indexOf("export function updatePartyALatestBalanceForSource"));
	const partyBUpdate = source.slice(source.indexOf("export function updatePartyBLatestBalance"));

	assert.match(schema, /type LatestAccountBalanceRemovalGuard @entity\(immutable: false\)/);
	assert.match(source, /LatestAccountBalanceRemovalGuard/);
	assert.match(source, /function markLatestBalanceRemoval/);
	assert.match(source, /function shouldSkipStaleLatestBalanceWrite/);
	assert.match(source, /guard\.logIndex\.gt\(event\.logIndex\)/);
	assert.match(source, /guard\.logIndex\.equals\(event\.logIndex\)/);

	for (const updateSource of [partyAUpdate, partyBUpdate]) {
		assert.match(updateSource, /markLatestBalanceRemoval\(id, event\)[\s\S]*store\.remove\("LatestAccountBalance", id\)/);
		assert.match(updateSource, /if \(shouldSkipStaleLatestBalanceWrite\(id, event\)\) return[\s\S]*entity\.save\(\)/);
	}
});

test("latest balances are reconciled once more at block end", () => {
	assert.match(schema, /type LatestAccountBalanceBlockRefresh @entity\(immutable: false\)/);
	assert.match(schema, /type LatestAccountBalanceBlockRefreshQueue @entity\(immutable: false\)/);
	assert.match(source, /function enqueueLatestBalanceBlockRefresh/);
	assert.match(source, /export function flushLatestAccountBalanceBlockRefreshes/);
	assert.match(source, /flushLatestAccountBalanceBlockRefreshes\(block: ethereum\.Block, source: Address, sourceVersion: Version\)/);
	assert.doesNotMatch(source, /versionFromInt/);
	assert.match(source, /applyPartyABalanceInfo\(entity, sourceVersion, source, account\)/);
	assert.match(source, /applyPartyBBalanceInfo\(entity, sourceVersion, source, account, balanceKey\)/);
	assert.match(source, /LatestAccountBalanceBlockRefreshQueue\.load/);
	assert.match(source, /store\.remove\("LatestAccountBalanceBlockRefresh"/);
	assert.match(source, /enqueueLatestBalanceBlockRefresh\([\s\S]*"PARTY_A"/);
	assert.match(source, /enqueueLatestBalanceBlockRefresh\([\s\S]*"PARTY_B"/);
	assert.match(manager, /\["blockHandlers"\] = \[\{"handler": "handleLatestAccountBalanceBlock"/);
	assert.match(manager, /handleLatestAccountBalanceBlockImpl\(block, \{version_enum\}\.v_\{contract\.version\}\)/);
	assert.match(manager, /"filter": \{"kind": "polling", "every": 1\}/);
	assert.match(manager, /target_module == "perps\/analytics"[\s\S]*contract\.abi == "symmio"/);
});
