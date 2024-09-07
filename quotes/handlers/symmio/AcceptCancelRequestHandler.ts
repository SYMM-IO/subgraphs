import {
	AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler
} from "../../../common/handlers/symmio/AcceptCancelRequestHandler"
import { getQuote, symbolIdToSymbolName } from "../../../common/contract_utils_0_8_2"
import { removeQuoteFromPendingList } from "../../../common/utils/quote"

import { InitialQuote, Quote } from "../../../generated/schema"
import { ethereum, log } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler";

import {
	getQuote as getQuote_0_8_2,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_2
} from "../../../common/contract_utils_0_8_2";
import {
	getQuote as getQuote_0_8_3,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_3
} from "../../../common/contract_utils_0_8_3";
import {
	getQuote as getQuote_0_8_0,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_0
} from "../../../common/contract_utils_0_8_0";
import { initialQuoteBuilder_0_8_0, initialQuoteBuilder_0_8_2, initialQuoteBuilder_0_8_3 } from "../../../common/utils/quote&analitics&user";
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

			let initialNewEntity: InitialQuote
			switch (version) {
				case Version.v_0_8_3: {
					const chainQuote = getQuote_0_8_3(event.address, event.params.quoteId)
					if (chainQuote == null) {
						log.error('accept cancel bind crashed!', [])
						return;
					}
					initialNewEntity = initialQuoteBuilder_0_8_3(chainQuote)
					if (initialNewEntity) {
						const symbol = symbolIdToSymbolName_0_8_3(initialNewEntity.symbolId, event.address)
						if (symbol) {
							initialNewEntity.symbol = symbol
						}
					}
					break
				}
				case Version.v_0_8_2: {
					const chainQuote = getQuote_0_8_2(event.address, event.params.quoteId)
					if (chainQuote == null) {
						log.error('accept cancel bind crashed!', [])
						return;
					}
					initialNewEntity = initialQuoteBuilder_0_8_2(chainQuote)
					if (initialNewEntity) {
						const symbol = symbolIdToSymbolName_0_8_2(initialNewEntity.symbolId, event.address)
						if (symbol) {
							initialNewEntity.symbol = symbol
						}
					}
					break
				}
				case Version.v_0_8_0: {
					const chainQuote = getQuote_0_8_0(event.address, event.params.quoteId)
					if (chainQuote == null) {
						log.error('accept cancel bind crashed!', [])
						return;
					}
					initialNewEntity = initialQuoteBuilder_0_8_0(chainQuote)
					if (initialNewEntity) {
						const symbol = symbolIdToSymbolName_0_8_0(initialNewEntity.symbolId, event.address)
						if (symbol) {
							initialNewEntity.symbol = symbol
						}
					}
					break
				}
			}

			initialNewEntity.save()
			quote.partyA = initialNewEntity.partyA
			quote.tradingFee = initialNewEntity.tradingFee!
			quote.initialData = initialNewEntity.id

			quote.action = 'AcceptCancelRequest'
			quote.eventsTimestamp = quoteStr
			quote.transactionsHash = quoteStr
			quote.timeStamp = event.block.timestamp
			quote.blockNumber = event.block.number
			quote.save()
		}
	}
}
