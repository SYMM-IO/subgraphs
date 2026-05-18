import { assert, describe, test } from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { FundingFeeState } from "../generated/schema"
import {
	applySetEpochDurationToFundingFeeState,
	applySetLongFundingFeeToFundingFeeState,
	isActiveFundingFeeState,
} from "../perps/analytics/utils/fundingFeeState"

function newState(): FundingFeeState {
	let state = new FundingFeeState("14-0xf62a670cda28ffae65ee2a42d6cf6cf05ec5e775-0x99641e06d38f327166b3a48f86ca2cbb3b4fb7eb")
	state.source = Address.fromString("0x99641e06d38f327166b3a48f86ca2cbb3b4fb7eb")
	state.symbolId = BigInt.fromI32(14)
	state.symbolName = "BIO::22..D2_SFLOW"
	state.partyB = Address.fromString("0xf62a670cda28ffae65ee2a42d6cf6cf05ec5e775")
	state.currentLongRate = BigInt.zero()
	state.currentShortRate = BigInt.zero()
	state.accumulatedLongRate = BigInt.zero()
	state.accumulatedShortRate = BigInt.zero()
	state.epochDuration = BigInt.zero()
	state.lastUpdatedEpoch = BigInt.zero()
	state.startEpoch = BigInt.zero()
	state.startEpochTimestamp = BigInt.zero()
	state.lastUpdatedTimestamp = BigInt.zero()
	state.snapshotLongFee = BigInt.zero()
	state.snapshotShortFee = BigInt.zero()
	state.updateTimestamp = BigInt.zero()
	return state
}

describe("funding fee state fallback reducer", () => {
	test("derives complete checkpoint state from funding events when the contract view cannot enrich", () => {
		let state = newState()
		let durationTimestamp = BigInt.fromString("1777877524")
		let longTimestamp = BigInt.fromString("1777877580")

		applySetEpochDurationToFundingFeeState(state, BigInt.fromI32(600), durationTimestamp)
		applySetLongFundingFeeToFundingFeeState(state, BigInt.fromString("10000000000000000"), BigInt.fromString("60000000000000000"), longTimestamp)

		assert.bigIntEquals(state.epochDuration!, BigInt.fromI32(600))
		assert.bigIntEquals(state.lastUpdatedEpoch!, BigInt.fromString("2963129"))
		assert.bigIntEquals(state.lastUpdatedTimestamp!, longTimestamp)
		assert.bigIntEquals(state.startEpoch!, BigInt.fromString("2963129"))
		assert.bigIntEquals(state.startEpochTimestamp!, longTimestamp)
		assert.bigIntEquals(state.currentLongRate!, BigInt.fromString("600000000000000"))
		assert.bigIntEquals(state.currentShortRate!, BigInt.zero())
		assert.bigIntEquals(state.accumulatedLongRate!, BigInt.zero())
		assert.bigIntEquals(state.snapshotLongFee!, BigInt.zero())
		assert.booleanEquals(isActiveFundingFeeState(state), true)
	})

	test("treats default zero-duration storage as inactive", () => {
		let state = newState()

		assert.booleanEquals(isActiveFundingFeeState(state), false)
	})
})
