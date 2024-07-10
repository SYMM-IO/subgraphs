import {
	DeallocatePartyAHandler as CommonDeallocatePartyAHandler
} from "../../../common/handlers/symmio/DeallocatePartyAHandler"
import {getGlobalCounterAndInc} from "../../../common/utils"
import {PartyA} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class DeallocatePartyAHandler<T> extends CommonDeallocatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleGlobalCounter()
		let deAllocateEntity = PartyA.load(event.params.user.toHex())
		let globalCounter = getGlobalCounterAndInc()
		if (deAllocateEntity) {
			deAllocateEntity.amount = deAllocateEntity.amount.minus(event.params.amount)
		} else {
			deAllocateEntity = new PartyA(event.params.user.toHex())
			deAllocateEntity.index = globalCounter
			deAllocateEntity.partyA = event.params.user
			deAllocateEntity.amount = event.params.amount
		}
		deAllocateEntity.timeStamp = event.block.timestamp
		deAllocateEntity.trHash = event.transaction.hash
		deAllocateEntity.blockNumber = event.block.number
		deAllocateEntity.GlobalCounter = globalCounter
		deAllocateEntity.save()
	}
}
