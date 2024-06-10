import { AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler } from "../../common/handlers/AcceptCancelRequestHandler"
import { getGlobalCounterAndInc, getQuote, symbolIdToSymbolName } from "../../common/utils"
import { removeQuoteFromPendingList } from "../../common/utils/quote"
import { initialHelper, setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"

import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { AcceptCancelRequest } from "../../generated/symmio/symmio"

export class AcceptCancelRequestHandler extends CommonAcceptCancelRequestHandler {

	constructor(event: AcceptCancelRequest) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		let event = super.getEvent()
		removeQuoteFromPendingList(event.params.quoteId)
		const quoteStr = event.params.quoteId.toString()
		let quote = Quote.load(quoteStr)
		if (!quote) {
			quote = new Quote(quoteStr)
			quote.globalCounter = getGlobalCounterAndInc()
			quote.quoteId = event.params.quoteId
			quote.quoteStatus = event.params.quoteStatus
			quote.timeStamp = event.block.timestamp

			const quoteData = getQuote(quote.quoteId, event.address)
			let initialquote = initialHelper(quoteData)
			const symbol = symbolIdToSymbolName(initialquote.symbolId, event.address)
			initialquote.symbol = symbol
			initialquote.save()
			quote.partyA = initialquote.partyA
			quote.tradingFee = initialquote.tradingFee!
			quote.initialData = initialquote.id
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quoteStr, this.event.block.timestamp,
				'AcceptCancelRequest', this.event.transaction.hash)
		}
	}
}
