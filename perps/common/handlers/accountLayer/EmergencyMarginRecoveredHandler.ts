import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { MarginTransfer } from "../../../../generated/schema"

export class EmergencyMarginRecoveredHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
		let mt = new MarginTransfer(id)
		mt.type = "EMERGENCY_RECOVER"
		mt.virtualAccount = event.params.virtualAccount.toHexString()
		mt.subAccount = event.params.subAccount.toHexString()
		mt.amount = event.params.amount
		mt.source = event.address
		mt.timestamp = event.block.timestamp
		mt.blockNumber = event.block.number
		mt.transaction = event.transaction.hash
		mt.save()
	}
}
