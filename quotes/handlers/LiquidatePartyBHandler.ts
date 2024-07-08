import {ethereum, log} from "@graphprotocol/graph-ts"
import {LiquidatePartyBHandler as CommonLiquidatePartyBHandler} from "../../common/handlers/LiquidatePartyBHandler"

import {PartyA, PartyBPartyA, Quote} from "../../generated/schema"
import {setEventTimestampAndTransactionHashAndAction} from "../../common/utils/quote&analitics&user"
import {Version} from "../../common/BaseHandler";

export class LiquidatePartyBHandler<T> extends CommonLiquidatePartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		let partyBPartyA = PartyBPartyA.load(event.params.partyA.toHexString() + '-' + event.params.partyB.toHexString())!
		const list = partyBPartyA.quoteUntilLiquid!.slice(0)
		partyBPartyA.globalCounter = super.handleGlobalCounter()
		for (let i = 0, lenQ = list.length; i < lenQ; i++) {
			const quoteId = list[i]
			let quote = Quote.load(quoteId.toString())!
			if (quote.quoteStatus <= 2 && quote.quoteStatus >= 0) {
				quote.quoteStatus = 8
				quote.globalCounter = super.handleGlobalCounter()
				quote.save()
				setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'LiquidatePartyB', _event)
			} else {
				log.error(`error in liquidate positions party B\nQuoteId: ${quoteId}\nQuote status: ${quote.quoteStatus}`, [])
			}
		}
		let partyA = PartyA.load(event.params.partyA.toHexString())!
		partyA.globalCounter = super.handleGlobalCounter()
		partyBPartyA.quoteUntilLiquid = []
		partyA.quoteUntilLiquid = []
		partyA.save()
		partyBPartyA.save()
	}
}
