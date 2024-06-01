import { BaseHandler } from "./BaseHandler"
import { OpenPosition } from "../../generated/symmio/symmio"
import { Account, InitialQuote, Quote } from "../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { BigInt } from "@graphprotocol/graph-ts"
import { getGlobalCounterAndInc, getQuote } from "../utils"

export class OpenPositionHandler extends BaseHandler {
	protected event: OpenPosition

	constructor(event: OpenPosition) {
		super(event)
		this.event = event
	}

	protected getEvent(): OpenPosition {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.fillAmount = this.event.params.filledAmount
		quote.openedPrice = this.event.params.openedPrice
		quote.quoteStatus = 4
		quote.timeStamp = this.event.block.timestamp
		quote.quantity = this.event.params.filledAmount
		quote.initialOpenedPrice = this.event.params.openedPrice
		quote.fundingRateOpenedPrice = this.event.params.openedPrice
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'OpenPosition', this.event.transaction.hash)
		if (quote.orderTypeOpen === 0) {
			const initialEntity = InitialQuote.load(quote.initialData!)!

			let q = getQuote(this.event.params.quoteId, this.event.address)
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
			initialEntity.quantity = this.event.params.filledAmount
			initialEntity.save()
		}
		quote.save()
	}

	handleAccount(): void {
		super.handleAccount()
		const event = this.event
		let account = Account.load(event.params.partyA.toHexString())!
		account.positionsCount = account.positionsCount.plus(BigInt.fromString("1"))
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}