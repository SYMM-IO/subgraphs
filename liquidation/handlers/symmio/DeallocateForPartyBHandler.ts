import {
	DeallocateForPartyBHandler as CommonDeallocateForPartyBHandler
} from "../../../common/handlers/symmio/DeallocateForPartyBHandler"
import { PartyB } from "../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";
import { DeallocateForPartyB as DeallocateForPartyB_8_3 } from "../../../generated/symmio_0_8_3/symmio_0_8_3";
import { DeallocateForPartyB as DeallocateForPartyB_8_2 } from "../../../generated/symmio_0_8_2/symmio_0_8_2";

export class DeallocateForPartyBHandler<T> extends CommonDeallocateForPartyBHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		const globalCounter = super.handleGlobalCounter()
		let deAllocateEntity = PartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())!

		const isVersion_8_3 = version == Version.v_0_8_3
		let eventAmount: BigInt
		if (isVersion_8_3) {
			// @ts-ignore
			let e = changetype<DeallocateForPartyB_8_3>(_event)
			eventAmount = e.params.newAllocatedBalance
		} else {
			// @ts-ignore
			let e = changetype<DeallocateForPartyB_8_2>(_event)
			eventAmount = e.params.amount
		}

		deAllocateEntity.amount = isVersion_8_3 ? eventAmount : deAllocateEntity.amount.minus(eventAmount)
		deAllocateEntity.timeStamp = event.block.timestamp
		deAllocateEntity.trHash = event.transaction.hash
		deAllocateEntity.blockNumber = event.block.number
		deAllocateEntity.GlobalCounter = globalCounter
		deAllocateEntity.save()
	}
}
