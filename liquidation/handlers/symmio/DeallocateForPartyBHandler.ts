import {
	DeallocateForPartyBHandler as CommonDeallocateForPartyBHandler
} from "../../../common/handlers/symmio/DeallocateForPartyBHandler"
import {PartyB} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class DeallocateForPartyBHandler<T> extends CommonDeallocateForPartyBHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		const globalCounter = super.handleGlobalCounter()
		let deAllocateEntity = PartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())!

		deAllocateEntity.amount = deAllocateEntity.amount.minus(event.params.amount)
		deAllocateEntity.timeStamp = event.block.timestamp
		deAllocateEntity.trHash = event.transaction.hash
		deAllocateEntity.blockNumber = event.block.number
		deAllocateEntity.GlobalCounter = globalCounter
		deAllocateEntity.save()
	}
}
