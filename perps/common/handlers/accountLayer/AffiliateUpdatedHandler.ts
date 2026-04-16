import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Affiliate, SymmioEntity } from "../../../../generated/schema"

export class AffiliateUpdatedHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let affiliate = Affiliate.load(event.params.affiliate.toHexString())
		if (affiliate) {
			affiliate.name = event.params.name
			affiliate.brandColor = event.params.brandColor
			affiliate.updateTimestamp = event.block.timestamp
			affiliate.save()
		}

		const id = event.params.affiliate.toHexString()
		let player = SymmioEntity.load(id)
		if (!player) {
			player = new SymmioEntity(id)
			player.address = event.params.affiliate
			player.type = "Affiliate"
		}
		player.name = event.params.name
		player.brandColor = event.params.brandColor
		player.save()
	}
}
