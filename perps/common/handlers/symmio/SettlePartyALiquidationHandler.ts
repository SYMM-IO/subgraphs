import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../../generated/schema"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_2 } from "../../../../generated/symmio_0_8_2/symmio_0_8_2"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { getLiquidationStateData } from "../../VersionedQuoteLoader"

export class SettlePartyALiquidationHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		if (version < Version.v_0_8_1) return

		let liquidationId: Bytes
		let partyBs: Bytes[] = []

		if (version >= Version.v_0_8_3) {
			if (version == Version.v_0_8_5) {
				// @ts-ignore
				const e = changetype<SettlePartyALiquidation_0_8_5>(_event)
				liquidationId = e.params.liquidationId
				for (let i = 0; i < e.params.partyBs.length; i++) {
					partyBs.push(e.params.partyBs[i])
				}
			} else if (version == Version.v_0_8_4) {
				// @ts-ignore
				const e = changetype<SettlePartyALiquidation_0_8_4>(_event)
				liquidationId = e.params.liquidationId
				for (let i = 0; i < e.params.partyBs.length; i++) {
					partyBs.push(e.params.partyBs[i])
				}
			} else {
				// @ts-ignore
				const e = changetype<SettlePartyALiquidation_0_8_3>(_event)
				liquidationId = e.params.liquidationId
				for (let i = 0; i < e.params.partyBs.length; i++) {
					partyBs.push(e.params.partyBs[i])
				}
			}
		} else {
			// v0.8.1-v0.8.2: no liquidationId on event, get from struct
			const liqState = getLiquidationStateData(version, event.address, event.params.partyA)
			if (!liqState) return
			liquidationId = liqState.liquidationId
			if (version == Version.v_0_8_2) {
				// @ts-ignore
				const e = changetype<SettlePartyALiquidation_0_8_2>(_event)
				for (let i = 0; i < e.params.partyBs.length; i++) {
					partyBs.push(e.params.partyBs[i])
				}
			}
		}

		let entityId = event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) return

		let amounts: BigInt[] = []
		if (version == Version.v_0_8_5) {
			// @ts-ignore
			let a = changetype<SettlePartyALiquidation_0_8_5>(_event).params.amounts
			for (let i = 0; i < a.length; i++) amounts.push(a[i])
		} else if (version == Version.v_0_8_4) {
			// @ts-ignore
			let a = changetype<SettlePartyALiquidation_0_8_4>(_event).params.amounts
			for (let i = 0; i < a.length; i++) amounts.push(a[i])
		} else if (version == Version.v_0_8_3) {
			// @ts-ignore
			let a = changetype<SettlePartyALiquidation_0_8_3>(_event).params.amounts
			for (let i = 0; i < a.length; i++) amounts.push(a[i])
		} else if (version == Version.v_0_8_2) {
			// @ts-ignore
			let a = changetype<SettlePartyALiquidation_0_8_2>(_event).params.amounts
			for (let i = 0; i < a.length; i++) amounts.push(a[i])
		}

		let mergedPartyBs: Bytes[] = []
		let existingPartyBs = entity.settledPartyBs
		if (existingPartyBs !== null) {
			for (let i = 0; i < existingPartyBs.length; i++) mergedPartyBs.push(existingPartyBs[i])
		}
		for (let i = 0; i < partyBs.length; i++) mergedPartyBs.push(partyBs[i])
		entity.settledPartyBs = mergedPartyBs

		let mergedAmounts: BigInt[] = []
		let existingAmounts = entity.settledAmounts
		if (existingAmounts !== null) {
			for (let i = 0; i < existingAmounts.length; i++) mergedAmounts.push(existingAmounts[i])
		}
		for (let i = 0; i < amounts.length; i++) mergedAmounts.push(amounts[i])
		entity.settledAmounts = mergedAmounts

		// Only mark fully settled when the on-chain involvedPartyBCounts hits 0.
		let liqState = getLiquidationStateData(version, event.address, event.params.partyA)
		if (liqState && liqState.involvedPartyBCounts.equals(BigInt.zero())) {
			entity.settled = true
		}
		entity.save()
	}
}
