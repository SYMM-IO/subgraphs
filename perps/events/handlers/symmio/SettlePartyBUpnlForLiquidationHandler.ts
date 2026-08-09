import { PartyBQuoteSettlementData, SettlePartyBUpnlForLiquidation as EventEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { findAccountSourceForQuote } from "../../utils/account_utils"
import { setRawEventMetadata } from "./rawEvent"

export class SettlePartyBUpnlForLiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entityId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
		const entity = new EventEntity(entityId)
		const settlementDataIds: string[] = []
		const partyAs: Bytes[] = []

		for (let i = 0; i < event.params.settlementData.length; i++) {
			const data = event.params.settlementData[i]
			const dataId = entityId + "-" + i.toString()
			const dataEntity = new PartyBQuoteSettlementData(dataId)
			dataEntity.quoteId = data.quoteId
			dataEntity.accountSource = findAccountSourceForQuote(data.quoteId.toString() + "-" + event.address.toHexString())
			dataEntity.currentPrice = data.currentPrice
			dataEntity.partyAIndex = data.partyAIndex
			dataEntity.save()
			settlementDataIds.push(dataId)
		}
		for (let i = 0; i < event.params.partyAs.length; i++) partyAs.push(event.params.partyAs[i])

		entity.liquidatedPartyA = event.params.liquidatedPartyA
		entity.partyB = event.params.partyB
		entity.settlementId = event.params.settlementId
		entity.settlementData = settlementDataIds
		entity.updatedPrices = event.params.updatedPrices
		entity.partyAs = partyAs
		entity.newPartyAsAllocatedBalances = event.params.newPartyAsAllocatedBalances
		entity.newPartyBAllocatedBalance = event.params.newPartyBAllocatedBalance
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
