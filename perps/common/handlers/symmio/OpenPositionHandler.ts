import {BaseHandler, Version} from "../../BaseHandler"
import {Quote} from "../../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts"
import {getQuoteData} from "../../VersionedQuoteLoader"
import {setEventTimestampAndTransactionHashAndAction} from "../../utils/quote"

export class OpenPositionHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())!
		quote.globalCounter = super.handleGlobalCounter()
		quote.quoteId = event.params.quoteId
		quote.fillAmount = event.params.filledAmount
		quote.openedPrice = event.params.openedPrice
		quote.quoteStatus = 4
		quote.quantity = event.params.filledAmount
		quote.initialOpenedPrice = event.params.openedPrice

		let data = getQuoteData(version, event.address, event.params.quoteId)!

		quote.cva = data.cva
		quote.partyAmm = data.partyAmm
		quote.partyBmm = data.partyBmm
		quote.lf = data.lf
		quote.initialCva = data.cva
		quote.initialPartyAmm = data.partyAmm
		quote.initialPartyBmm = data.partyBmm
		quote.initialLf = data.lf
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, 'OpenPosition', _event)
	}
}
