import { log } from "@graphprotocol/graph-ts"
import { LiquidatePartyBHandler as CommonLiquidatePartyBHandler } from "../../common/handlers/LiquidatePartyBHandler"

import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { LiquidatePartyB } from "../../generated/symmio/symmio"
import { getGlobalCounterAndInc } from "../../common/utils"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"

export class LiquidatePartyBHandler extends CommonLiquidatePartyBHandler {

	constructor(event: LiquidatePartyB) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		const event = super.getEvent()
		let partyBpartyA = PartyBPartyA.load(this.event.params.partyA.toHexString() + '-' + this.event.params.partyB.toHexString())!
		const list = partyBpartyA.quoteUntilLiquid!.slice(0)
		partyBpartyA.globalCounter = super.handleGlobalCounter()
		for (let i = 0, lenQ = list.length; i < lenQ; i++) {
			const quoteId = list[i]
			let quote = Quote.load(quoteId.toString())!
			if (quote.quoteStatus <= 2 && quote.quoteStatus >= 0) {
				quote.quoteStatus = 8
				quote.globalCounter = super.handleGlobalCounter()
				quote.save()
				setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, event.block.timestamp,
					'LiquidatePartyB', event.transaction.hash, event.block.number)
			} else {
				log.error(`error in liquidate positions party B\nQuoteId: ${quoteId}\nQuote status: ${quote.quoteStatus}`, [])
			}
		}
		let partyA = PartyA.load(this.event.params.partyA.toHexString())!
		partyA.globalCounter = super.handleGlobalCounter()
		partyBpartyA.quoteUntilLiquid = []
		partyA.quoteUntilLiquid = []
		partyA.save()
		partyBpartyA.save()

	}
}
