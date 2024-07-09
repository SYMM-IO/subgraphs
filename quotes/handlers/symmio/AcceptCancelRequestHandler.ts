import {
	AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler
} from "../../../common/handlers/symmio/AcceptCancelRequestHandler"
import {getQuote, symbolIdToSymbolName} from "../../../common/utils"
import {removeQuoteFromPendingList} from "../../../common/utils/quote"
import {initialHelper,} from "../../../common/utils/quote&analitics&user"

import {Quote} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AcceptCancelRequestHandler<T> extends CommonAcceptCancelRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		removeQuoteFromPendingList(event.params.quoteId)
		const quoteStr = event.params.quoteId.toString()
		let quote = Quote.load(quoteStr)
		if (!quote) {
			quote = new Quote(quoteStr)
			quote.globalCounter = super.handleGlobalCounter()
			quote.quoteId = event.params.quoteId
			quote.quoteStatus = event.params.quoteStatus

			const quoteData = getQuote(quote.quoteId, event.address)
			let initialQuote = initialHelper(quoteData)
			initialQuote.symbol = symbolIdToSymbolName(initialQuote.symbolId, event.address)
			initialQuote.save()
			quote.partyA = initialQuote.partyA
			quote.tradingFee = initialQuote.tradingFee!
			quote.initialData = initialQuote.id
			quote.action = 'AcceptCancelRequest'
			quote.eventsTimestamp = quoteStr
			quote.transactionsHash = quoteStr
			quote.timeStamp = event.block.timestamp
			quote.blockNumber = event.block.number
			quote.save()
		}
	}
}
