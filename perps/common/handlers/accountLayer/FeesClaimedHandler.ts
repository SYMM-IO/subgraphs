import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { FeeClaim } from "../../../../generated/schema"

export class FeesClaimedHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
		let fc = new FeeClaim(id)
		fc.affiliate = event.params.affiliate.toHexString()
		fc.symmio = event.params.symmio
		fc.amount = event.params.amount
		fc.source = event.address
		fc.timestamp = event.block.timestamp
		fc.blockNumber = event.block.number
		fc.transaction = event.transaction.hash
		fc.save()
	}
}
