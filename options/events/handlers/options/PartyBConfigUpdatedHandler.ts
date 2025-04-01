import { PartyBConfig, PartyBConfigUpdated as PartyBConfigUpdatedEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class PartyBConfigUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new PartyBConfigUpdatedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.partyB = event.params.partyB

		let partyBConfigDataArray: string[] = []
		let partyB_config = new PartyBConfig(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		partyB_config.isActive = event.params.config.isActive
		partyB_config.lossCoverage = event.params.config.lossCoverage
		partyB_config.oracleId = event.params.config.oracleId
		partyB_config.symbolType = event.params.config.symbolType
		partyB_config.save()
		partyBConfigDataArray.push(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.config = partyBConfigDataArray

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
