import { DistributeCollateral as DistributeCollateralEntity } from "../../../../generated/schema"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class DistributeCollateralHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new DistributeCollateralEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.liquidationId = event.params.liquidationId
		entity.partyB = event.params.partyB
		entity.collateral = event.params.collateral
		const partyAs: Bytes[] = []
		for (let i = 0; i < event.params.partyAs.length; i++) {
			partyAs.push(event.params.partyAs[i])
		}
		entity.partyAs = partyAs
		const amounts: BigInt[] = []
		for (let i = 0; i < event.params.amounts.length; i++) {
			amounts.push(event.params.amounts[i])
		}
		entity.amounts = amounts

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
