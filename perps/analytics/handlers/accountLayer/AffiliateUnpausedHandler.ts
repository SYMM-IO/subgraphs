import { AffiliateUnpausedHandler as CommonAffiliateUnpausedHandler } from "../../../common/handlers/accountLayer/AffiliateUnpausedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { AccountLayerVersion } from "../../../common/BaseHandler"

export class AffiliateUnpausedHandler<T> extends CommonAffiliateUnpausedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		super.handle(_event, version)
	}
}
