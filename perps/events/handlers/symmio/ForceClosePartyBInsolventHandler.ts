import { ForceClosePartyBInsolvent as ForceClosePartyBInsolventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class ForceClosePartyBInsolventHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new ForceClosePartyBInsolventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.quoteId = event.params.quoteId
		entity.partyA = event.params.partyA
		entity.partyB = event.params.partyB
		entity.closedPrice = event.params.closedPrice
		entity.currentPrice = event.params.currentPrice
		entity.upnlPartyB = event.params.upnlPartyB
		entity.partyBAvailableAfterClose = event.params.partyBAvailableAfterClose

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
