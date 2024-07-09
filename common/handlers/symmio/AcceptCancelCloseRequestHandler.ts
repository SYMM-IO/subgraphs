import {BaseHandler, Version} from "../../BaseHandler"
import {symmio_0_8_2} from "../../../generated/symmio_0_8_2/symmio_0_8_2"
import {Quote} from "../../../generated/schema"
import {initialHelper, setEventTimestampAndTransactionHashAndAction} from "../../utils/quote&analitics&user"
import {ethereum, log} from "@graphprotocol/graph-ts"
import {symbolIdToSymbolName} from "../../utils"

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
			let symmioContract = symmio_0_8_2.bind(event.address)
			let callResult = symmioContract.try_getQuote(event.params.quoteId)
			if (callResult.reverted) {
				log.error('accept cancel bind crashed!', [])
			} else {
				let Result = callResult.value as ethereum.Tuple
				let initialNewEntity = initialHelper(Result)
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
			}
			setEventTimestampAndTransactionHashAndAction(newEntity.eventsTimestamp, 'AcceptCancelCloseRequest', _event)
			newEntity.save()
		}
	}
}