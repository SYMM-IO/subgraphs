import { log } from "@graphprotocol/graph-ts"
import {
	LiquidatePendingPositionsPartyAHandler as CommonLiquidatePendingPositionsPartyAHandler,
} from "../../common/handlers/LiquidatePendingPositionsPartyAHandler"

import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { LiquidatePendingPositionsPartyA } from "../../generated/symmio/symmio"
import { getGlobalCounterAndInc } from "../../common/utils"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"

export class LiquidatePendingPositionsPartyAHandler extends CommonLiquidatePendingPositionsPartyAHandler {

	constructor(event: LiquidatePendingPositionsPartyA) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		const event = super.getEvent()
		let partyAEntity = PartyA.load(this.event.params.partyA.toHexString())!
		partyAEntity.globalCounter = super.handleGlobalCounter()
		const list = partyAEntity.quoteUntilLiquid!.slice(0)
		for (let i = 0, lenQ = list.length; i < lenQ; i++) {
			const quoteId = list[i]
			let quote = Quote.load(quoteId.toString())!
			quote.globalCounter = super.handleGlobalCounter()
			if (quote.quoteStatus <= 2 && quote.quoteStatus >= 0) {
				quote.quoteStatus = 8
				quote.save()
				setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, event.block.timestamp,
					'LiquidatePendingPositionsPartyA', event.transaction.hash, event.block.number)
				const partyB = quote.partyB
				if (partyB) {
					let partyAPartyBEntity = PartyBPartyA.load(this.event.params.partyA.toHexString() + '-' + partyB.toHexString())!
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
