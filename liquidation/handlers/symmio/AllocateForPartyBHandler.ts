import {
	AllocateForPartyBHandler as CommonAllocateForPartyBHandler
} from "../../../common/handlers/symmio/AllocateForPartyBHandler"
import { PartyB } from "../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";
import { AllocateForPartyB as AllocateForPartyB_8_3 } from "../../../generated/symmio_0_8_3/symmio_0_8_3";
import { AllocateForPartyB as AllocateForPartyB_8_2 } from "../../../generated/symmio_0_8_2/symmio_0_8_2";

export class AllocateForPartyBHandler<T> extends CommonAllocateForPartyBHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		const globalCounter = super.handleGlobalCounter()

		const isVersion_8_3 = version == Version.v_0_8_3
		let eventAmount: BigInt
		if (isVersion_8_3) {
			// @ts-ignore
			let e = changetype<AllocateForPartyB_8_3>(_event)
			eventAmount = e.params.newAllocatedBalance
		} else {
			// @ts-ignore
			let e = changetype<AllocateForPartyB_8_2>(_event)
			eventAmount = e.params.amount
		}

		let allocateEntity = PartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
		if (allocateEntity) {
			allocateEntity.amount = isVersion_8_3 ? eventAmount : allocateEntity.amount.plus(eventAmount)
		} else {
			allocateEntity = new PartyB(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
			allocateEntity.index = globalCounter
			allocateEntity.amount = eventAmount
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
