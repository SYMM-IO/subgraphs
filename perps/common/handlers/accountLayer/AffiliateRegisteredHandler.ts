import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Affiliate, SymmioEntity } from "../../../../generated/schema"
import { accountLayer_1 } from "../../../../generated/accountLayer_1/accountLayer_1"

export class AffiliateRegisteredHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let affiliate = new Affiliate(event.params.affiliate.toHexString())
		affiliate.address = event.params.affiliate
		affiliate.name = event.params.name
		let contract = accountLayer_1.bind(_event.address)
		let adminResult = contract.try_getAffiliateAdmin(event.params.affiliate)
		affiliate.admin = adminResult.reverted ? event.transaction.from : adminResult.value
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
