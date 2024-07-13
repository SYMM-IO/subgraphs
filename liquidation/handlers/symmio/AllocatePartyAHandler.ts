import {
	AllocatePartyAHandler as CommonAllocatePartyAHandler
} from "../../../common/handlers/symmio/AllocatePartyAHandler"
import {getGlobalCounterAndInc} from "../../../common/utils"
import { Liquidator, PartyA } from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AllocatePartyAHandler<T> extends CommonAllocatePartyAHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleGlobalCounter()
		let allocateEntity = PartyA.load(event.params.user.toHex())
		let globalCounter = getGlobalCounterAndInc()
		if (allocateEntity) {
			allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
		} else {
			allocateEntity = new PartyA(event.params.user.toHex())
			allocateEntity.index = globalCounter
			allocateEntity.partyA = event.params.user
			allocateEntity.amount = event.params.amount
		}
		allocateEntity.timeStamp = event.block.timestamp
		allocateEntity.trHash = event.transaction.hash
		allocateEntity.blockNumber = event.block.number
		allocateEntity.GlobalCounter = globalCounter
		allocateEntity.save()
		let liquidator = Liquidator.load(event.params.user.toHexString());
		if (liquidator) {
			liquidator.balance = liquidator.balance.plus(event.params.amount)
			liquidator.save()
		}
	}
}
