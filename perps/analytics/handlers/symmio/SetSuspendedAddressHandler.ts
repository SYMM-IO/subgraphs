import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createSuspension, loadLatestSuspension } from "../../utils/accountSuspension"

export class SetSuspendedAddressHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let suspension = loadLatestSuspension(event.address, event.params.user)

		if (event.params.isSuspended) {
			if (suspension == null || !suspension.isSuspended) {
				suspension = createSuspension(_event, event.params.user)
				suspension.suspendTransaction = event.transaction.hash
				suspension.suspendTimestamp = event.block.timestamp
				suspension.suspendBlockNumber = event.block.number
				suspension.suspendLogIndex = event.logIndex
			}
		} else {
			if (suspension == null) suspension = createSuspension(_event, event.params.user)
			if (suspension.isSuspended) {
				suspension.isSuspended = false
				suspension.unsuspendTransaction = event.transaction.hash
				suspension.unsuspendTimestamp = event.block.timestamp
				suspension.unsuspendBlockNumber = event.block.number
				suspension.unsuspendLogIndex = event.logIndex
			}
		}

		suspension.updateTimestamp = event.block.timestamp
		suspension.save()
	}
}
