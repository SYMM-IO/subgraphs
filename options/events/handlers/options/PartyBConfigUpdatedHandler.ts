// biome-ignore-all lint/style/useImportType: AssemblyScript does not support type-only imports.
import { PartyBConfig, PartyBConfigUpdated as PartyBConfigUpdatedEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class PartyBConfigUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-expect-error
		const event = changetype<T>(_event)

		const entity = new PartyBConfigUpdatedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.partyB = event.params.partyB

		const configId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
		const partyBConfig = new PartyBConfig(configId)
		partyBConfig.isActive = event.params.config.isActive
		partyBConfig.lossCoverage = event.params.config.lossCoverage
		partyBConfig.oracleId = event.params.config.oracleId
		partyBConfig.symbolType = event.params.config.symbolType
		partyBConfig.save()
		entity.config = configId

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
