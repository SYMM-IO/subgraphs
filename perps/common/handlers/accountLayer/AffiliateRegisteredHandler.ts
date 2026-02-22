import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Affiliate } from "../../../../generated/schema"

export class AffiliateRegisteredHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let affiliate = new Affiliate(event.params.affiliate.toHexString())
		affiliate.address = event.params.affiliate
		affiliate.name = event.params.name
		affiliate.admin = event.transaction.from
		affiliate.status = "PENDING"
		affiliate.source = event.address
		affiliate.timestamp = event.block.timestamp
		affiliate.updateTimestamp = event.block.timestamp
		affiliate.save()
	}
}
