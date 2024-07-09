import {LockQuoteHandler as CommonLockQuoteHandler} from "../../../common/handlers/symmio/LockQuoteHandler"

import {PartyBPartyA, Quote} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class LockQuoteHandler<T> extends CommonLockQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		let entity = Quote.load(event.params.quoteId.toString())!

		let partyAPartyBEntity = PartyBPartyA.load(entity.partyA.toHexString() + '-' + event.params.partyB.toHexString())
		if (!partyAPartyBEntity) {
			partyAPartyBEntity = new PartyBPartyA(entity.partyA.toHexString() + '-' + event.params.partyB.toHexString())
			partyAPartyBEntity.quoteUntilLiquid = [event.params.quoteId]
		} else {
			let temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
			temp.push(event.params.quoteId)
			partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
		}
		partyAPartyBEntity.globalCounter = super.handleGlobalCounter()
		partyAPartyBEntity.save()
	}
}
