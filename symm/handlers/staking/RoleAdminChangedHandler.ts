import { ethereum } from "@graphprotocol/graph-ts"
import { SymmStakingVersion } from "../../BaseHandler"
import { getGlobalCounterAndInc } from "../../utils"
import { StakingRoleAdminChanged } from "../../../generated/schema"

export class RoleAdminChangedHandler<T> {
	handle(_event: ethereum.Event, version: SymmStakingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new StakingRoleAdminChanged(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.role = event.params.role
		entity.previousAdminRole = event.params.previousAdminRole
		entity.newAdminRole = event.params.newAdminRole
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
