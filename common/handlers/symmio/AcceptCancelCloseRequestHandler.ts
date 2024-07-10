import {BaseHandler, Version} from "../../BaseHandler"
import {InitialQuote, Quote} from "../../../generated/schema"
import {initialHelper, setEventTimestampAndTransactionHashAndAction} from "../../utils/quote&analitics&user"
import {ethereum, log} from "@graphprotocol/graph-ts"
import {symbolIdToSymbolName} from "../../utils"
import {getQuote as getQuote_0_8_2} from "../../contract_utils_0_8_2";
import {getQuote as getQuote_0_8_0} from "../../contract_utils_0_8_0";

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
				case Version.v_0_8_2: {
					const chainQuote = getQuote_0_8_2(event.address, event.params.quoteId)
					if (chainQuote == null) {
						log.error('accept cancel bind crashed!', [])
						return;
					}
					let Result = chainQuote as ethereum.Tuple
					initialNewEntity = initialHelper(Result)
					break
				}
				case Version.v_0_8_0: {
					const chainQuote = getQuote_0_8_0(event.address, event.params.quoteId)
					if (chainQuote == null) {
						log.error('accept cancel bind crashed!', [])
						return;
					}
					let Result = chainQuote as ethereum.Tuple
					initialNewEntity = initialHelper(Result)
					break
				}
			}
			if (initialNewEntity) {
				const symbol = symbolIdToSymbolName(initialNewEntity.symbolId, event.address)
				if (symbol) {
					initialNewEntity.symbol = symbol
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