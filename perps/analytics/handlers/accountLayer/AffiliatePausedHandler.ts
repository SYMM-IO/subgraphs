import { AffiliatePausedHandler as CommonAffiliatePausedHandler } from "../../../common/handlers/accountLayer/AffiliatePausedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { AccountLayerVersion } from "../../../common/BaseHandler"

export class AffiliatePausedHandler<T> extends CommonAffiliatePausedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		super.handle(_event, version)
	}
}
