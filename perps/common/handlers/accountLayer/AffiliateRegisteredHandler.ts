import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Affiliate, SymmioEntity } from "../../../../generated/schema"

export class AffiliateRegisteredHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let affiliate = new Affiliate(event.params.affiliate.toHexString())
		affiliate.address = event.params.affiliate
		affiliate.name = event.params.name
		affiliate.admin = event.transaction.from
		affiliate.status = "PENDING"
		affiliate.stakeholdersUpdatePending = false
		affiliate.source = event.address
		affiliate.timestamp = event.block.timestamp
		affiliate.updateTimestamp = event.block.timestamp
		affiliate.save()

		const id = event.params.affiliate.toHexString()
		let player = SymmioEntity.load(id)
		if (!player) {
			player = new SymmioEntity(id)
			player.address = event.params.affiliate
			player.type = "Affiliate"
		}
		player.name = event.params.name
		player.save()
	}
}
