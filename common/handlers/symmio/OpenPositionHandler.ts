import {BaseHandler, Version} from "../../BaseHandler"
import {InitialQuote, Quote} from "../../../generated/schema"
import {setEventTimestampAndTransactionHashAndAction} from "../../utils/quote&analitics&user"
import {ethereum} from "@graphprotocol/graph-ts"
import {getQuote} from "../../utils"

export class OpenPositionHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString())!
		quote.globalCounter = super.handleGlobalCounter()
		quote.quoteId = event.params.quoteId
		quote.fillAmount = event.params.filledAmount
		quote.openedPrice = event.params.openedPrice
		quote.quoteStatus = 4
		quote.quantity = event.params.filledAmount
		quote.initialOpenedPrice = event.params.openedPrice
		quote.fundingRateOpenedPrice = event.params.openedPrice

		const initialEntity = InitialQuote.load(quote.initialData!)!

		let q = getQuote(event.params.quoteId, event.address)
		const newCva = q.lockedValues.cva
		const newPartyAmm = q.lockedValues.partyAmm
		const newPartyBmm = q.lockedValues.partyBmm
		const newLF = q.lockedValues.lf

		quote.cva = newCva
		quote.partyAmm = newPartyAmm
		quote.partyBmm = newPartyBmm
		quote.lf = newLF
		initialEntity.cva = newCva
		initialEntity.partyAmm = newPartyAmm
		initialEntity.partyBmm = newPartyBmm
		initialEntity.lf = newLF
		initialEntity.quantity = event.params.filledAmount
		initialEntity.save()
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'OpenPosition', _event)
	}
}