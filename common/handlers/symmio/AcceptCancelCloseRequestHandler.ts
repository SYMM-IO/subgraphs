import { BaseHandler, Version } from "../../BaseHandler"
import { InitialQuote, Quote } from "../../../generated/schema"
import {
	initialQuoteBuilder_0_8_0,
	initialQuoteBuilder_0_8_2,
	initialQuoteBuilder_0_8_3,
	setEventTimestampAndTransactionHashAndAction
} from "../../utils/quote&analitics&user"
import { ethereum, log } from "@graphprotocol/graph-ts"
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

export class AcceptCancelCloseRequestHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let quote = Quote.load(event.params.quoteId.toString())
		if (quote) {
			quote.globalCounter = super.handleGlobalCounter()
			quote.quoteStatus = event.params.quoteStatus
			quote.blockNumber = event.block.number
			quote.timeStamp = event.block.timestamp
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'AcceptCancelCloseRequest', _event)
		} else {
			let newEntity = new Quote(event.params.quoteId.toString())
			newEntity.globalCounter = super.handleGlobalCounter()
			newEntity.quoteId = event.params.quoteId
			newEntity.quoteStatus = event.params.quoteStatus
			newEntity.timeStamp = event.block.timestamp

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
			newEntity.partyA = initialNewEntity.partyA
			newEntity.tradingFee = initialNewEntity.tradingFee!
			newEntity.initialData = initialNewEntity.id
			setEventTimestampAndTransactionHashAndAction(newEntity.eventsTimestamp, 'AcceptCancelCloseRequest', _event)
			newEntity.save()
		}
	}
}