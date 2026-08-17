import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("perps/analytics/utils/latestAccountBalance.ts", "utf8");
const blockSource = readFileSync("perps/analytics/src_latest_account_balance_block.ts", "utf8");
const schema = readFileSync("perps/analytics/schema.graphql", "utf8");
const manager = readFileSync("scripts/manager.py", "utf8");
const migrationGuide = readFileSync("docs/0.8.5_migration.md", "utf8");
const baseConfig = JSON.parse(readFileSync("configs/perps/base.json", "utf8"));

test("total balance counts free and allocated collateral without counting lock reservations twice", () => {
	const balanceSetter = source.slice(source.indexOf("function setFreeAndTotalBalance("), source.indexOf("function finalizeBalance("));
	const eventFinalizer = source.slice(source.indexOf("function finalizeBalance("), source.indexOf("function finalizeBalanceAtBlock("));
	const blockFinalizer = source.slice(source.indexOf("function finalizeBalanceAtBlock("), source.indexOf("function isPartyALatestBalanceEmpty("));

	assert.match(balanceSetter, /entity\.totalBalance = freeBalance\.plus\(entity\.allocatedBalance\)/);
	assert.doesNotMatch(balanceSetter, /\.plus\(entity\.(?:locked|pendingLocked)/);

	for (const finalizer of [eventFinalizer, blockFinalizer]) {
		assert.match(finalizer, /setFreeAndTotalBalance\(entity, free\)/);
	}

	assert.match(schema, /Free plus allocated collateral; locked and pending locked values are already backed by allocated balance\./);
	assert.match(migrationGuide, /`"PARTY_A"`/);
	assert.match(migrationGuide, /`"PARTY_B"`/);
	assert.match(migrationGuide, /cross bucket \(`balanceKey` is the zero address\)/);
	assert.match(migrationGuide, /accountType: "PARTY_B"/);
});

test("PartyB counterparty buckets are cleared when bucket-specific balances are zero", () => {
	const partyBUpdate = source.slice(source.indexOf("export function updatePartyBLatestBalance"));
	const removalPredicate = source.slice(
		source.indexOf("function isPartyBLatestBalanceBucketEmpty"),
		source.indexOf("function resolvePartyBBalanceKey"),
	);

	assert.match(removalPredicate, /entity\.allocatedBalance\.isZero\(\)/);
	assert.match(removalPredicate, /entity\.lockedCva\.isZero\(\)/);
	assert.match(removalPredicate, /entity\.pendingLockedPartyBmm\.isZero\(\)/);
	assert.doesNotMatch(removalPredicate, /entity\.freeBalance\.isZero\(\)/);
	assert.match(partyBUpdate, /if \(isPartyBLatestBalanceBucketEmpty\(entity\)\)/);
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
		assert.match(updateSource, /markLatestBalanceRemoval\(id, event\)[\s\S]*removeLatestAccountBalanceRow\(id, /);
		assert.match(updateSource, /if \(shouldSkipStaleLatestBalanceWrite\(id, event\)\) return[\s\S]*entity\.save\(\)/);
	}
});

test("event updates stay immediate while aged balances use a periodic safety sweep", () => {
	const partyAUpdate = source.slice(source.indexOf("export function updatePartyALatestBalanceForSource"));
	const partyBUpdate = source.slice(source.indexOf("export function updatePartyBLatestBalance"));

	// Event handlers remain the primary write path. The polling handler is only a
	// low-frequency repair pass for rows that drift after a missed trigger.
	assert.match(partyAUpdate, /entity\.save\(\)/);
	assert.match(partyBUpdate, /entity\.save\(\)/);
	assert.doesNotMatch(schema, /type LatestAccountBalanceBlockRefresh/);
	assert.doesNotMatch(schema, /type LatestAccountBalanceBlockRefreshQueue/);
	assert.doesNotMatch(source, /enqueueLatestBalanceBlockRefresh/);
	assert.doesNotMatch(source, /flushLatestAccountBalanceBlockRefreshes/);

	// Registry entities exist so the sweep can iterate live rows from mapping code.
	assert.match(schema, /type LatestAccountBalanceSweepMeta @entity\(immutable: false\)/);
	assert.match(schema, /type LatestAccountBalanceRegistryNode @entity\(immutable: false\)/);
	assert.match(schema, /lastVerifiedTimestamp: BigInt!/);

	// Rows are registered on every save and unregistered on every removal; outside the
	// removal helper nothing deletes a row directly.
	assert.match(source, /function touchLatestBalanceRegistryNode/);
	assert.match(source, /function removeLatestAccountBalanceRow/);
	const updates = source.slice(source.indexOf("export function updatePartyALatestBalance"));
	assert.doesNotMatch(updates, /store\.remove\("LatestAccountBalance"/);
	assert.match(source, /export function sweepLatestAccountBalances\(block: ethereum\.Block, source: Address, sourceVersion: Version\)/);

	// The sweep walks tail-first, bounds its eth_call work, and dispatches with the
	// block handler's data-source version.
	const sweep = source.slice(
		source.indexOf("export function sweepLatestAccountBalances"),
		source.indexOf("export function updatePartyALatestBalance"),
	);
	assert.match(sweep, /meta\.tail/);
	assert.match(sweep, /MAX_VERIFICATIONS_PER_SWEEP/);
	assert.match(sweep, /VERIFY_MIN_AGE_SECONDS/);
	assert.match(sweep, /SWEEP_PERIOD_SECONDS/);
	assert.match(sweep, /applyPartyABalanceInfo\(entity, sourceVersion, source, account\)/);
	assert.match(sweep, /applyPartyBBalanceInfo\(entity, sourceVersion, source, account, /);
	assert.match(sweep, /isPartyALatestBalanceEmpty\(entity\)/);
	assert.match(sweep, /isPartyBLatestBalanceBucketEmpty\(entity\)/);
	assert.match(sweep, /removeLatestAccountBalanceRow\(id, source\)/);
	assert.match(
		sweep,
		/if \(!applied\) \{\s*touchLatestBalanceRegistryNode\(id, source, block\.timestamp\)\s*continue\s*\}/,
		"failed balance-info reads must rotate away from the tail",
	);
	assert.match(
		sweep,
		/if \(!finalizeBalanceAtBlock[\s\S]*touchLatestBalanceRegistryNode\(id, source, block\.timestamp\)[\s\S]*continue/,
		"failed free-balance reads must rotate away from the tail",
	);

	// The generated manifest wakes the fallback roughly every 30 minutes on Base
	// instead of forcing Graph Node to execute this mapping on every block.
	assert.match(blockSource, /sweepLatestAccountBalances\(block, source, version\)/);
	assert.doesNotMatch(blockSource, /flushLatestAccountBalanceBlockRefreshes/);
	assert.match(manager, /\["blockHandlers"\] = \[\{"handler": "handleLatestAccountBalanceBlock"/);
	assert.match(manager, /handleLatestAccountBalanceBlockImpl\(block, \{version_enum\}\.v_\{contract\.version\}\)/);
	assert.match(manager, /"filter": \{"kind": "polling", "every": 1000\}/);
	assert.doesNotMatch(manager, /"filter": \{"kind": "polling", "every": 1\}/);
	assert.match(manager, /target_module == "perps\/analytics"[\s\S]*contract\.abi == "symmio"/);
});

test("event updates and sweeps share the same version-aware balance tuple adapters", () => {
	const partyAUpdate = source.slice(
		source.indexOf("export function updatePartyALatestBalanceForSource"),
		source.indexOf("export function updatePartyBLatestBalance"),
	);
	const partyBUpdate = source.slice(source.indexOf("export function updatePartyBLatestBalance"));
	const partyAAdapter = source.slice(source.indexOf("function applyPartyABalanceInfo"), source.indexOf("function applyPartyBBalanceInfo"));
	const partyBAdapter = source.slice(
		source.indexOf("function applyPartyBBalanceInfo"),
		source.indexOf("export function sweepLatestAccountBalances"),
	);

	assert.match(partyAUpdate, /applyPartyABalanceInfo\(entity, version, source, partyA\)/);
	assert.match(partyBUpdate, /applyPartyBBalanceInfo\(entity, version, event\.address, partyB, balanceKey\)/);
	assert.doesNotMatch(partyAUpdate, /getBalanceInfoOfPartyA_0_8_/);
	assert.doesNotMatch(partyBUpdate, /getBalanceInfoOfPartyB_0_8_/);

	// v0.8.0 returned (allocated, cva, mm, lf, total, pendingCva, pendingMm,
	// pendingLf, pendingTotal). Totals must never be mistaken for MM buckets.
	assert.match(partyAAdapter, /lockedPartyAmm = info\.value2/);
	assert.match(partyAAdapter, /lockedLf = info\.value3/);
	assert.match(partyAAdapter, /lockedPartyBmm = BigInt\.zero\(\)/);
	assert.match(partyAAdapter, /pendingLockedPartyAmm = info\.value6/);
	assert.match(partyAAdapter, /pendingLockedLf = info\.value7/);
	assert.match(partyAAdapter, /pendingLockedPartyBmm = BigInt\.zero\(\)/);
	assert.match(partyBAdapter, /lockedPartyBmm = info\.value2/);
	assert.match(partyBAdapter, /lockedLf = info\.value3/);
	assert.match(partyBAdapter, /lockedPartyAmm = BigInt\.zero\(\)/);
	assert.match(partyBAdapter, /pendingLockedPartyBmm = info\.value6/);
	assert.match(partyBAdapter, /pendingLockedLf = info\.value7/);
	assert.match(partyBAdapter, /pendingLockedPartyAmm = BigInt\.zero\(\)/);
});

test("latest balance sweeps remain disabled during configured historical backfill", () => {
	assert.equal(baseConfig.latestAccountBalanceSweepActivationBlock, "49127992");
	assert.match(manager, /latestAccountBalanceSweepActivationBlock/);
	assert.match(manager, /"type": "BigInt"/);

	const activationGuard = blockSource.indexOf("block.number.lt(activationBlock)");
	const sweepCall = blockSource.indexOf("sweepLatestAccountBalances(block, source, version)");
	assert.match(blockSource, /dataSource\.context\(\)/);
	assert.match(blockSource, /getBigInt\("latestAccountBalanceSweepActivationBlock"\)/);
	assert.notEqual(activationGuard, -1);
	assert.ok(activationGuard < sweepCall, "activation guard must run before the reconciliation sweep");
});
