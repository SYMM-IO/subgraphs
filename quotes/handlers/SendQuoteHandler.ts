import {SendQuoteHandler as CommonSendQuoteHandler} from "../../common/handlers/SendQuoteHandler"

import {PartyA} from "../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../common/BaseHandler";

export class SendQuoteHandler<T> extends CommonSendQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		let partyAEntity = PartyA.load(event.params.partyA.toHexString())
		if (!partyAEntity) {
			partyAEntity = new PartyA(event.params.partyA.toHexString())
			partyAEntity.quoteUntilLiquid = [event.params.quoteId]
		} else {
			let temp = partyAEntity.quoteUntilLiquid!.slice(0)
			temp.push(event.params.quoteId)

			partyAEntity.quoteUntilLiquid = temp.slice(0)
		}
		partyAEntity.globalCounter = super.handleGlobalCounter()
		partyAEntity.save()
	}
}
