import {
	AllocatePartyAHandler as CommonAllocatePartyAHandler
} from "../../../common/handlers/symmio/AllocatePartyAHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { Liquidator, PartyA } from "../../../generated/schema";
import { ethereum } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";
import { AllocatePartyA as AllocatePartyA_8_2 } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import { AllocatePartyA as AllocatePartyA_8_3 } from "../../../generated/symmio_0_8_3/symmio_0_8_3";


export class AllocatePartyAHandler<T> extends CommonAllocatePartyAHandler<T> {

	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleGlobalCounter()
		let allocateEntity = PartyA.load(event.params.user.toHex())
		let globalCounter = getGlobalCounterAndInc()
		if (allocateEntity) {
			if (version == Version.v_0_8_2) {
				// @ts-ignore
				const e = changetype<AllocatePartyA_8_2>(_event)
				allocateEntity.amount = allocateEntity.amount.plus(e.params.amount)
			} else if (version == Version.v_0_8_3) {
				// @ts-ignore
				const e = changetype<AllocatePartyA_8_3>(_event)
				allocateEntity.amount = event.params.newAllocatedBalance
			}
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
			if (version == Version.v_0_8_2) {
				// @ts-ignore
				const e = changetype<AllocatePartyA_8_2>(_event)
				liquidator.balance = liquidator.balance.plus(event.params.amount)
			} else if (version == Version.v_0_8_3) {
				// @ts-ignore
				const e = changetype<AllocatePartyA_8_3>(_event)
				liquidator.balance = event.params.newAllocatedBalance
			}
			liquidator.balance = liquidator.balance.plus(event.params.amount)
			liquidator.save()
		}
	}
}
