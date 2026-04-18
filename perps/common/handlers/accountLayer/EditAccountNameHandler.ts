import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Account, SubAccount } from "../../../../generated/schema"

export class EditAccountNameHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		this.handleAccount(_event, version)
	}

	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.account.toHexString())
		if (account) {
			account.name = event.params.name
			account.updateTimestamp = event.block.timestamp
			account.save()
		}
		let sub = SubAccount.load(event.params.account.toHexString())
		if (sub) {
			sub.name = event.params.name
			sub.updateTimestamp = event.block.timestamp
			sub.save()
		}
	}
}
