import { HookAllowedSelectorsSet as HookAllowedSelectorsSetEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class HookAllowedSelectorsSetHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new HookAllowedSelectorsSetEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.affiliate = event.params.affiliate
		let selectorsArray: Bytes[] = []
		for (let i = 0, len = event.params.selectors.length; i < len; i++) {
			selectorsArray.push(event.params.selectors[i])
		}
		entity.selectors = selectorsArray
		entity.allowed = event.params.allowed
		entity.blockNumber = event.block.number
		entity.blockTimestamp = event.block.timestamp
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
