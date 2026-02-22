import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { VirtualAccount } from "../../../../generated/schema"

export class VirtualAccountDeletedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let va = VirtualAccount.load(event.params.account.toHexString())
		if (va) {
			va.isDeleted = true
			va.updateTimestamp = event.block.timestamp
			va.save()
		}
	}
}
