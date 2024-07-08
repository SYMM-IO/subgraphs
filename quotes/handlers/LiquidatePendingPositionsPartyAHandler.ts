import {ethereum, log} from "@graphprotocol/graph-ts"
import {
	LiquidatePendingPositionsPartyAHandler as CommonLiquidatePendingPositionsPartyAHandler,
} from "../../common/handlers/LiquidatePendingPositionsPartyAHandler"

import {PartyA, PartyBPartyA, Quote} from "../../generated/schema"
import {setEventTimestampAndTransactionHashAndAction} from "../../common/utils/quote&analitics&user"
import {Version} from "../../common/BaseHandler";

export class LiquidatePendingPositionsPartyAHandler<T> extends CommonLiquidatePendingPositionsPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		let partyAEntity = PartyA.load(event.params.partyA.toHexString())!
		partyAEntity.globalCounter = super.handleGlobalCounter()
		const list = partyAEntity.quoteUntilLiquid!.slice(0)
		for (let i = 0, lenQ = list.length; i < lenQ; i++) {
			const quoteId = list[i]
			let quote = Quote.load(quoteId.toString())!
			quote.globalCounter = super.handleGlobalCounter()
			if (quote.quoteStatus <= 2 && quote.quoteStatus >= 0) {
				quote.quoteStatus = 8
				quote.save()
				setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'LiquidatePendingPositionsPartyA', _event)
				const partyB = quote.partyB
				if (partyB) {
					let partyAPartyBEntity = PartyBPartyA.load(event.params.partyA.toHexString() + '-' + partyB.toHexString())!
					partyAPartyBEntity.globalCounter = super.handleGlobalCounter()
					partyAPartyBEntity.quoteUntilLiquid = []
					partyAPartyBEntity.save()
				}
			} else {
				log.error(`error in liquidate positions party A\nQuoteId: ${quoteId}\nQuote status: ${quote.quoteStatus}`, [])
			}
		}
	}
}
