import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account, CvaLf, LiquidationDetail } from "../../../../generated/schema"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_4 } from "../../../common/contract_utils_0_8_4"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_3 } from "../../../common/contract_utils_0_8_3"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_2 } from "../../../common/contract_utils_0_8_2"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_1 } from "../../../common/contract_utils_0_8_1"

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

		switch (version) {
			case Version.v_0_8_4: {
				// @ts-ignore
				const event_ = changetype<SettlePartyALiquidation_0_8_4>(_event)
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_4(event.address, event.params.partyA)!
				let entity = LiquidationDetail.load(
					event.params.partyA.toHexString() + "-" + event_.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
				)
				if (!entity)
					entity = new LiquidationDetail(
						event.params.partyA.toHexString() + "-" + event_.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
				entity.source = event.address
				entity.liquidationId = liquidationDetail.liquidationId
				entity.liquidationType = liquidationDetail.liquidationType
				entity.upnl = liquidationDetail.upnl
				entity.totalUnrealizedLoss = liquidationDetail.totalUnrealizedLoss
				entity.deficit = liquidationDetail.deficit
				entity.liquidationFee = liquidationDetail.liquidationFee
				entity.timestamp = liquidationDetail.timestamp
				entity.involvedPartyBCounts = liquidationDetail.involvedPartyBCounts
				entity.partyAAccumulatedUpnl = liquidationDetail.partyAAccumulatedUpnl
				entity.disputed = liquidationDetail.disputed
				entity.liquidationTimestamp = liquidationDetail.liquidationTimestamp
				entity.save()
				break
			}
			case Version.v_0_8_3: {
				// @ts-ignore
				const event_ = changetype<SettlePartyALiquidation_0_8_3>(_event)
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_3(event.address, event.params.partyA)!
				let entity = LiquidationDetail.load(
					event.params.partyA.toHexString() + "-" + event_.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
				)
				if (!entity)
					entity = new LiquidationDetail(
						event.params.partyA.toHexString() + "-" + event_.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
				entity.source = event.address
				entity.liquidationId = liquidationDetail.liquidationId
				entity.liquidationType = liquidationDetail.liquidationType
				entity.upnl = liquidationDetail.upnl
				entity.totalUnrealizedLoss = liquidationDetail.totalUnrealizedLoss
				entity.deficit = liquidationDetail.deficit
				entity.liquidationFee = liquidationDetail.liquidationFee
				entity.timestamp = liquidationDetail.timestamp
				entity.involvedPartyBCounts = liquidationDetail.involvedPartyBCounts
				entity.partyAAccumulatedUpnl = liquidationDetail.partyAAccumulatedUpnl
				entity.disputed = liquidationDetail.disputed
				entity.liquidationTimestamp = liquidationDetail.liquidationTimestamp
				entity.save()
				break
			}
			case Version.v_0_8_2: {
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_2(event.address, event.params.partyA)!
				let entity = LiquidationDetail.load(
					event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
				)
				if (!entity)
					entity = new LiquidationDetail(
						event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
				entity.source = event.address
				entity.liquidationId = liquidationDetail.liquidationId
				entity.liquidationType = liquidationDetail.liquidationType
				entity.upnl = liquidationDetail.upnl
				entity.totalUnrealizedLoss = liquidationDetail.totalUnrealizedLoss
				entity.deficit = liquidationDetail.deficit
				entity.liquidationFee = liquidationDetail.liquidationFee
				entity.timestamp = liquidationDetail.timestamp
				entity.involvedPartyBCounts = liquidationDetail.involvedPartyBCounts
				entity.partyAAccumulatedUpnl = liquidationDetail.partyAAccumulatedUpnl
				entity.disputed = liquidationDetail.disputed
				entity.save()
				break
			}
			case Version.v_0_8_1: {
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_1(event.address, event.params.partyA)!
				let entity = LiquidationDetail.load(
					event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
				)
				if (!entity)
					entity = new LiquidationDetail(
						event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
				entity.source = event.address
				entity.liquidationId = liquidationDetail.liquidationId
				entity.liquidationType = liquidationDetail.liquidationType
				entity.upnl = liquidationDetail.upnl
				entity.totalUnrealizedLoss = liquidationDetail.totalUnrealizedLoss
				entity.deficit = liquidationDetail.deficit
				entity.liquidationFee = liquidationDetail.liquidationFee
				entity.timestamp = liquidationDetail.timestamp
				entity.involvedPartyBCounts = liquidationDetail.involvedPartyBCounts
				entity.partyAAccumulatedUpnl = liquidationDetail.partyAAccumulatedUpnl
				entity.disputed = liquidationDetail.disputed
				entity.save()
				break
			}
		}

		const account = Account.load(event.params.partyA.toHexString())!
		updateHistories(new UpdateHistoriesParams(version, account, null, event).cvaPaid(cvaPaid).lfPaid(lfPaid))
	}
}
