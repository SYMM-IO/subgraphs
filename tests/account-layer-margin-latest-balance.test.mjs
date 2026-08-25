import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("account-layer margin handlers refresh affected core latest balances", () => {
	const addMargin = read("perps/common/handlers/accountLayer/AddMarginHandler.ts")
	const removeMargin = read("perps/common/handlers/accountLayer/RemoveMarginHandler.ts")
	const emergencyRecover = read("perps/common/handlers/accountLayer/EmergencyMarginRecoveredHandler.ts")
	const latestBalance = read("perps/analytics/utils/latestAccountBalance.ts")
	const marginBalances = read("perps/common/utils/accountLayerMarginBalances.ts")

	for (const [name, source] of [
		["AddMarginHandler", addMargin],
		["RemoveMarginHandler", removeMargin],
		["EmergencyMarginRecoveredHandler", emergencyRecover],
	]) {
		assert.match(source, /refreshAccountLayerMarginLatestBalances/, `${name} must refresh LatestAccountBalance rows`)
		assert.match(source, /event\.params\.subAccount/, `${name} must refresh the parent sub-account balance`)
		assert.match(source, /event\.params\.virtualAccount/, `${name} must refresh the virtual account balance`)
	}

	assert.match(latestBalance, /getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_6/, "latest balance helper must import v0.8.6 PartyA balance reads")
	assert.match(latestBalance, /version == Version\.v_0_8_6/, "latest balance helper must handle v0.8.6 explicitly")
	assert.match(marginBalances, /Version\.v_0_8_6/, "account-layer margin refresh must read the stage core with v0.8.6 ABI")
})

test("account-layer topology comes from canonical state instead of address registries", () => {
	const profile = read("perps/common/utils/profile.ts")
	const resolver = read("perps/common/utils/account_layer_resolver.ts")
	const addMargin = read("perps/common/handlers/accountLayer/AddMarginHandler.ts")
	const removeMargin = read("perps/common/handlers/accountLayer/RemoveMarginHandler.ts")
	const emergencyRecover = read("perps/common/handlers/accountLayer/EmergencyMarginRecoveredHandler.ts")
	const manager = read("scripts/manager.py")

	for (const [name, source] of [
		["profile", profile],
		["account-layer resolver", resolver],
	]) {
		assert.doesNotMatch(source, /0x[a-fA-F0-9]{40}/, `${name} must not contain deployment addresses`)
		assert.doesNotMatch(source, /registerDeployment|accountLayerMap/, `${name} must not maintain a deployment registry`)
	}

	assert.match(resolver, /try_getRelatedCore\(account\)/, "account-layer cache misses must retain an authoritative on-chain recovery path")
	assert.match(resolver, /currentAccountLayerSource/, "core events must receive their AccountLayer from generated data-source context")
	assert.match(profile, /account\.coreSource = normalizeCoreSource\(coreSource\)/, "profile persistence must reject zero core sources")
	assert.match(profile, /normalizeCoreSource\(account\.coreSource\)/, "core entity enrichment must reject zero cached topology")
	assert.match(addMargin, /resolveCoreSourceFromAccountLayer\(event\.address, event\.params\.subAccount\)/)
	assert.match(removeMargin, /resolveCoreSourceFromAccountLayer\(event\.address, event\.params\.subAccount\)/)
	assert.match(emergencyRecover, /resolveCoreSourceFromAccountLayer\(event\.address, event\.params\.subAccount\)/)
	assert.match(manager, /def build_data_source_context\(/, "the generator must own deployment topology")
})

test("account-layer core resolution uses indexed profiles as its cache", () => {
	const resolver = read("perps/common/utils/account_layer_resolver.ts")
	const commonSubAccountCreated = read("perps/common/handlers/accountLayer/SubAccountCreatedHandler.ts")
	const commonLegacyImported = read("perps/common/handlers/accountLayer/LegacyAccountImportedHandler.ts")
	const commonVirtualCreated = read("perps/common/handlers/accountLayer/VirtualAccountCreatedHandler.ts")
	const commonVirtualReused = read("perps/common/handlers/accountLayer/VirtualAccountReusedHandler.ts")
	const analyticsSubAccountCreated = read("perps/analytics/handlers/accountLayer/SubAccountCreatedHandler.ts")
	const coreCall = resolver.indexOf("contract.try_getRelatedCore(account)")

	assert.notEqual(coreCall, -1, "resolver must retain a recovery RPC for cache misses")
	for (const marker of ["SubAccount.load(id)", "VirtualAccount.load(id)", "Account.load(id)"]) {
		const cacheRead = resolver.indexOf(marker)
		assert.notEqual(cacheRead, -1, `missing ${marker} cache read`)
		assert.ok(cacheRead < coreCall, `${marker} must run before getRelatedCore`)
	}
	assert.match(resolver, /coreResult\.value[\s\S]*\.save\(\)/, "a successful fallback must repair an existing indexed profile")
	assert.match(resolver, /normalizeCoreSource\(subAccount\.coreSource\)/, "zero-valued SubAccount cache entries must be treated as unresolved")
	assert.match(resolver, /normalizeCoreSource\(virtualAccount\.coreSource\)/, "zero-valued VirtualAccount cache entries must be treated as unresolved")
	assert.match(resolver, /normalizeCoreSource\(profile\.coreSource\)/, "zero-valued Account cache entries must be treated as unresolved")
	assert.match(commonSubAccountCreated, /if \(coreSource === null\) coreSource = resolveCoreSourceFromAccountLayer/)
	assert.match(commonLegacyImported, /if \(coreSource === null\) coreSource = resolveCoreSourceFromAccountLayer/)
	assert.match(commonSubAccountCreated, /normalizeCoreSource\(subAccountData\.value\.symmioCore\)/)
	assert.match(commonLegacyImported, /normalizeCoreSource\(subAccountData\.value\.symmioCore\)/)
	assert.doesNotMatch(commonVirtualCreated, /coreSource\s*=\s*sub\.coreSource/, "virtual-account creation must keep the normalized resolver result")
	assert.doesNotMatch(commonVirtualReused, /coreSource\s*=\s*newSub\.coreSource/, "virtual-account reuse must keep the normalized resolver result")
	assert.doesNotMatch(analyticsSubAccountCreated, /try_getRelatedCore/, "analytics must reuse the core resolved by the common handler")
	assert.match(analyticsSubAccountCreated, /normalizeCoreSource\(account\.coreSource\)/)
	assert.match(analyticsSubAccountCreated, /if \(source === null\) return/, "unresolved cores must not create core-keyed analytics under the AccountLayer")
	assert.doesNotMatch(analyticsSubAccountCreated, /event\.address\s*:\s*account\.coreSource/, "the AccountLayer must never substitute for an unresolved core")
})

test("v0.8.6 analytics indexes core balance change events", () => {
	const deps = read("perps/analytics/deps_symmio_0_8_6.json")
	const source = read("perps/analytics/src_symmio_0_8_6.ts")

	assert.match(deps, /"BalanceChangePartyA"/, "v0.8.6 dependencies must subscribe to PartyA balance changes")
	assert.match(deps, /"BalanceChangePartyB"/, "v0.8.6 dependencies must subscribe to PartyB balance changes")
	assert.match(source, /BalanceChangePartyAHandler/, "v0.8.6 source must wire PartyA balance change handler")
	assert.match(source, /BalanceChangePartyBHandler/, "v0.8.6 source must wire PartyB balance change handler")
})
