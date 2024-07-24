import {
	AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler
} from "../../../common/handlers/symmio/AcceptCancelRequestHandler"
import { getQuote, symbolIdToSymbolName } from "../../../common/contract_utils_0_8_2"
import { removeQuoteFromPendingList } from "../../../common/utils/quote"
import { initialQuoteBuilder_0_8_2, } from "../../../common/utils/quote&analitics&user"

import { Quote } from "../../../generated/schema"
import { ethereum, log } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";

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

			const quoteData = getQuote(event.address, quote.quoteId)
			if (quoteData) {
				let initialQuote = initialQuoteBuilder_0_8_2(quoteData)
				initialQuote.symbol = symbolIdToSymbolName(initialQuote.symbolId, event.address)
				initialQuote.save()
				quote.partyA = initialQuote.partyA
				quote.tradingFee = initialQuote.tradingFee!
				quote.initialData = initialQuote.id
			} else {
				log.error('get quote in quoteid = {} teverted', [quote.quoteId.toString()])
			}
			quote.action = 'AcceptCancelRequest'
			quote.eventsTimestamp = quoteStr
			quote.transactionsHash = quoteStr
			quote.timeStamp = event.block.timestamp
			quote.blockNumber = event.block.number
			quote.save()
		}
	}
}
