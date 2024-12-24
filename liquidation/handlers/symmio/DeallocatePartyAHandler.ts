import {
	DeallocatePartyAHandler as CommonDeallocatePartyAHandler
} from "../../../common/handlers/symmio/DeallocatePartyAHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { Liquidator, PartyA } from "../../../generated/schema";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";
import { DeallocatePartyA as DeallocatePartyA_8_2 } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { DeallocatePartyA as DeallocatePartyA_8_3 } from "../../../generated/symmio_0_8_3/symmio_0_8_3";

export class DeallocatePartyAHandler<T> extends CommonDeallocatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleGlobalCounter()
		let deAllocateEntity = PartyA.load(event.params.user.toHex())
		let globalCounter = getGlobalCounterAndInc()

		const isVersion_8_3 = version == Version.v_0_8_3
		let eventAmount: BigInt
		if (isVersion_8_3) {
			// @ts-ignore
			let e = changetype<DeallocatePartyA_8_3>(_event)
			eventAmount = e.params.newAllocatedBalance
		} else {
			// @ts-ignore
			let e = changetype<DeallocatePartyA_8_2>(_event)
			eventAmount = e.params.amount
		}
		if (deAllocateEntity) {
			deAllocateEntity.amount = isVersion_8_3 ? eventAmount : deAllocateEntity.amount.minus(eventAmount)
		} else {
			deAllocateEntity = new PartyA(event.params.user.toHex())
			deAllocateEntity.index = globalCounter
			deAllocateEntity.partyA = event.params.user
			deAllocateEntity.amount = eventAmount
		}
		deAllocateEntity.timeStamp = event.block.timestamp
		deAllocateEntity.trHash = event.transaction.hash
		deAllocateEntity.blockNumber = event.block.number
		deAllocateEntity.GlobalCounter = globalCounter
		deAllocateEntity.save()
		let liquidator = Liquidator.load(event.params.user.toHexString());
		if (liquidator) {
			liquidator.balance = isVersion_8_3 ? eventAmount : liquidator.balance.minus(eventAmount)
			liquidator.save()
		}
	}
}
