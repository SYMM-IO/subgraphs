import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Affiliate } from "../../../../generated/schema"

export class RegistrationCancelledHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let affiliate = Affiliate.load(event.params.affiliate.toHexString())
		if (!affiliate) return
		affiliate.status = "CANCELLED"
		affiliate.pendingAdmin = null
		affiliate.feeDistributor = null
		affiliate.symmioShare = null
		affiliate.expressRate = null
		affiliate.virtualProvider = null
		affiliate.stakeholdersUpdatePending = false
		affiliate.updateTimestamp = event.block.timestamp
		affiliate.save()
	}
}
