import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { SubAccount } from "../../../../generated/schema"

export class SubAccountDeletedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let sub = SubAccount.load(event.params.account.toHexString())
		if (sub) {
			sub.isDeleted = true
			sub.updateTimestamp = event.block.timestamp
			sub.save()
		}
	}
}
