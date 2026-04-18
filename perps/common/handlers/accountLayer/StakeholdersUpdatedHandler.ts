import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Affiliate } from "../../../../generated/schema"
import { accountLayer_1 } from "../../../../generated/accountLayer_1/accountLayer_1"

export class StakeholdersUpdatedHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let affiliate = Affiliate.load(event.params.affiliate.toHexString())
		if (!affiliate) return
		affiliate.stakeholdersUpdatePending = false
		let contract = accountLayer_1.bind(_event.address)
		let shareResult = contract.try_getAffiliateSymmioShare(event.params.affiliate)
		if (!shareResult.reverted) {
			affiliate.symmioShare = shareResult.value
		}
		affiliate.updateTimestamp = event.block.timestamp
		affiliate.save()
	}
}
