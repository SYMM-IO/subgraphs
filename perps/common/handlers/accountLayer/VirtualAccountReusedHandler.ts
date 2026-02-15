import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Account } from "../../../../generated/schema"

export class VirtualAccountReusedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.account.toHexString())
		if (account) {
			account.isDeleted = false
			account.updateTimestamp = event.block.timestamp
			account.save()
		}
	}
}
