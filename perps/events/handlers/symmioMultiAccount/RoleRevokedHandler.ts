// biome-ignore-all lint/style/useImportType: AssemblyScript does not support type-only imports.
import { RoleRevoked as RoleRevokedEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { MultiAccountVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class RoleRevokedHandler<T> {
	handle(_event: ethereum.Event, _version: MultiAccountVersion): void {
		// @ts-expect-error changetype is an AssemblyScript global
		const event = changetype<T>(_event)

		const entity = new RoleRevokedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.source = event.address
		entity.counterId = getGlobalCounterAndInc()
		entity.role = event.params.role
		entity.user = event.params.account
		entity.account = event.params.account
		entity.sender = event.params.sender

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
