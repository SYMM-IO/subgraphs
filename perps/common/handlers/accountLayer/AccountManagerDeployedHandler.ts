import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Affiliate } from "../../../../generated/schema"

export class AccountManagerDeployedHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let affiliate = Affiliate.load(event.params.affiliate.toHexString())
		if (affiliate) {
			affiliate.accountManager = event.params.accountManager
			affiliate.updateTimestamp = event.block.timestamp
			affiliate.save()
		}
	}
}
