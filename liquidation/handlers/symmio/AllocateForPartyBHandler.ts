import {
	AllocateForPartyBHandler as CommonAllocateForPartyBHandler
} from "../../../common/handlers/symmio/AllocateForPartyBHandler"
import {PartyB} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AllocateForPartyBHandler<T> extends CommonAllocateForPartyBHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		const globalCounter = super.handleGlobalCounter()
		let allocateEntity = PartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
		if (allocateEntity) {
			allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
		} else {
			allocateEntity = new PartyB(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
			allocateEntity.index = globalCounter
			allocateEntity.amount = event.params.amount
			allocateEntity.partyA = event.params.partyA
			allocateEntity.partyB = event.params.partyB
		}
		allocateEntity.timeStamp = event.block.timestamp
		allocateEntity.trHash = event.transaction.hash
		allocateEntity.blockNumber = event.block.number
		allocateEntity.GlobalCounter = globalCounter
		allocateEntity.save()
	}
}
