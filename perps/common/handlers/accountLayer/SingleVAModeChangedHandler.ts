import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Account } from "../../../../generated/schema"

export class SingleVAModeChangedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.subAccount.toHexString())
		if (account) {
			account.singleVAMode = event.params.enabled
			account.updateTimestamp = event.block.timestamp
			account.save()
		}
	}
}
