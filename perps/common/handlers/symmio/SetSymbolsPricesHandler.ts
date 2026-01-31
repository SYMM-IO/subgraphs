import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../../generated/schema"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_4 } from "../../contract_utils_0_8_4"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_3 } from "../../contract_utils_0_8_3"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_2 } from "../../contract_utils_0_8_2"
import { getLiquidatedStateOfPartyA as getLiquidatedStateOfPartyA_0_8_1 } from "../../contract_utils_0_8_1"
import { SetSymbolsPrices as SetSymbolsPrices_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { SetSymbolsPrices as SetSymbolsPrices_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"

export class SetSymbolsPricesHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		switch (version) {
			case Version.v_0_8_4: {
				// @ts-ignore
				const event_ = changetype<SetSymbolsPrices_0_8_4>(_event)
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_4(event.address, event.params.partyA)
				if (!liquidationDetail) break
				let entity = LiquidationDetail.load(
					event.params.partyA.toHexString() + "-" + event_.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
				)
				if (!entity)
					entity = new LiquidationDetail(
						event.params.partyA.toHexString() + "-" + event_.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
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
				const event_ = changetype<SetSymbolsPrices_0_8_3>(_event)
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_3(event.address, event.params.partyA)
				if (!liquidationDetail) break
				let entity = LiquidationDetail.load(
					event.params.partyA.toHexString() + "-" + event_.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
				)
				if (!entity)
					entity = new LiquidationDetail(
						event.params.partyA.toHexString() + "-" + event_.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
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
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_2(event.address, event.params.partyA)
				if (!liquidationDetail) break
				let entity = LiquidationDetail.load(
					event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
				)
				if (!entity)
					entity = new LiquidationDetail(
						event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
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
				const liquidationDetail = getLiquidatedStateOfPartyA_0_8_1(event.address, event.params.partyA)
				if (!liquidationDetail) break
				let entity = LiquidationDetail.load(
					event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
				)
				if (!entity)
					entity = new LiquidationDetail(
						event.params.partyA.toHexString() + "-" + liquidationDetail.liquidationId.toHexString() + "-" + event.address.toHexString(),
					)
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
	}
}
