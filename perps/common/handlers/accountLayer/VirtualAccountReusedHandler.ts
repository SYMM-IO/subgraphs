import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Account, VirtualAccount } from "../../../../generated/schema"

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
		let va = VirtualAccount.load(event.params.account.toHexString())
		if (va) {
			va.isDeleted = false
			va.updateTimestamp = event.block.timestamp
			va.save()
		}
	}
}
