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

test("v0.8.6 analytics indexes core balance change events", () => {
	const deps = read("perps/analytics/deps_symmio_0_8_6.json")
	const source = read("perps/analytics/src_symmio_0_8_6.ts")

	assert.match(deps, /"BalanceChangePartyA"/, "v0.8.6 dependencies must subscribe to PartyA balance changes")
	assert.match(deps, /"BalanceChangePartyB"/, "v0.8.6 dependencies must subscribe to PartyB balance changes")
	assert.match(source, /BalanceChangePartyAHandler/, "v0.8.6 source must wire PartyA balance change handler")
	assert.match(source, /BalanceChangePartyBHandler/, "v0.8.6 source must wire PartyB balance change handler")
})
