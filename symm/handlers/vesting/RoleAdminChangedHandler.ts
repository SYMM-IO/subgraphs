import { ethereum } from "@graphprotocol/graph-ts"
import { SymmVestingVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { VestingRoleAdminChanged } from "../../../generated/schema"

export class RoleAdminChangedHandler<T> {
	handle(_event: ethereum.Event, version: SymmVestingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new VestingRoleAdminChanged(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
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
