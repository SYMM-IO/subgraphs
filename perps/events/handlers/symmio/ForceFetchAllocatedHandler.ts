import { ForceFetchAllocated as ForceFetchAllocatedEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class ForceFetchAllocatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new ForceFetchAllocatedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.partyB = event.params.partyB
		let partyAs: Bytes[] = []
		for (let i = 0; i < event.params.partyAs.length; i++) {
			partyAs.push(event.params.partyAs[i])
		}
		entity.partyAs = partyAs
		entity.FetchedAmount = event.params.FetchedAmount
		entity.newPartyBsAllocatedBalances = event.params.newPartyBsAllocatedBalances

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
