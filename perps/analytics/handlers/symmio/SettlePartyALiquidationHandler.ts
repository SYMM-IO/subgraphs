import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account, CvaLf, LiquidationDetail } from "../../../../generated/schema"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { getLiquidationStateData } from "../../../common/VersionedQuoteLoader"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"

export class SettlePartyALiquidationHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<SettlePartyALiquidation_0_8_3>(_event)

		let cvaPaid = BigInt.zero()
		const cva = CvaLf.load(event.transaction.hash.toHex() + "-6")
		if (cva) {
			cvaPaid = cva.amount
		}

		let lfPaid = BigInt.zero()
		const lf = CvaLf.load(event.transaction.hash.toHex() + "-8")
		if (lf) {
			lfPaid = lf.amount
		}

		if (version >= Version.v_0_8_1) {
			let liqState = getLiquidationStateData(version, event.address, event.params.partyA)
			if (liqState) {
				// Get liquidationId: from event params in v0.8.3+, from struct otherwise
				let liquidationId: Bytes = liqState.liquidationId
				if (version == Version.v_0_8_5) {
					// @ts-ignore
					const event_ = changetype<SettlePartyALiquidation_0_8_5>(_event)
					liquidationId = event_.params.liquidationId
				} else if (version == Version.v_0_8_4) {
					// @ts-ignore
					const event_ = changetype<SettlePartyALiquidation_0_8_4>(_event)
					liquidationId = event_.params.liquidationId
				} else if (version == Version.v_0_8_3) {
					// @ts-ignore
					const event_ = changetype<SettlePartyALiquidation_0_8_3>(_event)
					liquidationId = event_.params.liquidationId
				}

				let entityId = event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString()
				let entity = LiquidationDetail.load(entityId)
				if (!entity) entity = new LiquidationDetail(entityId)
				entity.source = event.address
				entity.liquidationId = liqState.liquidationId
				entity.liquidationType = liqState.liquidationType
				entity.upnl = liqState.upnl
				entity.totalUnrealizedLoss = liqState.totalUnrealizedLoss
				entity.deficit = liqState.deficit
				entity.liquidationFee = liqState.liquidationFee
				entity.timestamp = liqState.timestamp
				entity.involvedPartyBCounts = liqState.involvedPartyBCounts
				entity.partyAAccumulatedUpnl = liqState.partyAAccumulatedUpnl
				entity.disputed = liqState.disputed
				entity.liquidationTimestamp = liqState.liquidationTimestamp
				entity.save()
			}
		}

		const account = Account.load(event.params.partyA.toHexString())!
		updateHistories(new UpdateHistoriesParams(version, account, null, event).cvaPaid(cvaPaid).lfPaid(lfPaid))
	}
}
