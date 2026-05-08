import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { SubAccount } from "../../../../generated/schema"
import { routingMode } from "../../utils/profile"

export class SingleVAModeChangedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let sub = SubAccount.load(event.params.subAccount.toHexString())
		if (sub) {
			sub.singleVAMode = event.params.enabled
			sub.routingMode = routingMode(sub.isolationType, sub.singleVAMode)
			sub.updateTimestamp = event.block.timestamp
			sub.lastConfigTimestamp = event.block.timestamp
			sub.save()
		}
	}
}
