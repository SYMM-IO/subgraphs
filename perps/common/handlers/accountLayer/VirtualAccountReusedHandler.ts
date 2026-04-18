import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Account, VirtualAccount } from "../../../../generated/schema"

export class VirtualAccountReusedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let va = VirtualAccount.load(event.params.account.toHexString())
		if (va) {
			va.isDeleted = false
			va.parent = event.params.parent.toHexString()
			va.updateTimestamp = event.block.timestamp
			va.save()
		}
		let account = Account.load(event.params.account.toHexString())
		if (account) {
			account.updateTimestamp = event.block.timestamp
			account.save()
		}
		let parentAccount = Account.load(event.params.parent.toHexString())
		if (parentAccount) {
			parentAccount.updateTimestamp = event.block.timestamp
			parentAccount.save()
		}
	}
}
