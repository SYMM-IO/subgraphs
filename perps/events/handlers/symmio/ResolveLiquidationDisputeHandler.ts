import { ResolveLiquidationDispute as ResolveLiquidationDisputeEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class ResolveLiquidationDisputeHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new ResolveLiquidationDisputeEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		entity.amounts = event.params.amounts
		entity.disputed = event.params.disputed

		entity.liquidationId = _event.parameters.length >= 5 ? _event.parameters[4].value.toBytes() : Bytes.empty()

		entity.partyA = event.params.partyA
		if (event.params.partyBs) {
			let partyBs: Bytes[] = []
			for (let i = 0, len = event.params.partyBs.length; i < len; i++) {
				partyBs.push(event.params.partyBs[i])
			}
			entity.partyBs = partyBs
		}
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
