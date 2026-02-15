import { UnifiedQuoteSettlementData, SettleUpnlUnified as SettleUpnlUnifiedEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SettleUpnlUnifiedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SettleUpnlUnifiedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.settlementId = event.params.settlementId
		entity.updatedPrices = event.params.updatedPrices
		entity.partyB = event.params.partyB
		entity.newPartyBAllocatedBalance = event.params.newPartyBAllocatedBalance

		let partyAs: string[] = []
		for (let i = 0; i < event.params.partyAs.length; i++) {
			partyAs.push(event.params.partyAs[i].toHexString())
		}

		let newPartyAsAllocatedBalances = event.params.newPartyAsAllocatedBalances

		// Store each settlement data entry
		let settlementDataArray: string[] = []
		for (let i = 0; i < event.params.settlementData.length; i++) {
			let data = event.params.settlementData[i]
			let dataId = event.transaction.hash.toHex() + "-" + event.logIndex.toString() + "-" + i.toString()

			let quoteData = new UnifiedQuoteSettlementData(dataId)
			quoteData.quoteId = data.quoteId
			quoteData.currentPrice = data.currentPrice
			quoteData.partyAIndex = data.partyAIndex
			quoteData.save()

			settlementDataArray.push(dataId)
		}

		entity.settlementData = settlementDataArray
		let partyAsBytes: Bytes[] = []
		for (let i = 0; i < event.params.partyAs.length; i++) {
			partyAsBytes.push(event.params.partyAs[i])
		}
		entity.partyAs = partyAsBytes
		entity.newPartyAsAllocatedBalances = newPartyAsAllocatedBalances

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
