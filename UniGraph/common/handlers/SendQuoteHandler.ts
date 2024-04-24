import { BaseHandler } from "./BaseHandler"
import { SendQuote } from "../../generated/symmio/symmio"
import { getGlobalCounterAndInc, initialHelper } from "result-quote/src/helper"
import { symmio } from "result-quote/generated/symmio/symmio"
import { BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import { EventsTimestamp, InitialQuote, Quote, TransactionsHash } from "../../generated/schema"

export class SendQuoteHandler extends BaseHandler {
	protected event: SendQuote

	constructor(event: SendQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
		let quote = new Quote(this.event.params.quoteId.toString())
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.orderTypeOpen = this.event.params.orderType
		quote.partyA = this.event.params.partyA
		quote.symbolId = this.event.params.symbolId
		quote.positionType = this.event.params.positionType
		quote.requestedOpenPrice = this.event.params.price
		quote.quantity = this.event.params.quantity
		quote.cva = this.event.params.cva
		quote.partyAmm = this.event.params.partyAmm
		quote.partyBmm = this.event.params.partyBmm
		quote.lf = this.event.params.lf
		quote.openDeadline = this.event.params.deadline
		quote.quoteStatus = 0
		quote.marketPrice = this.event.params.marketPrice
		quote.averageClosedPrice = BigInt.fromI32(0)
		quote.closedAmount = BigInt.fromI32(0)
		quote.tradingFee = this.event.params.tradingFee

		let initialQuote = new InitialQuote(this.event.params.quoteId.toString())
		quote.initialData = initialQuote.id
		initialQuote.quoteId = this.event.params.quoteId
		initialQuote.orderTypeOpen = this.event.params.orderType
		initialQuote.partyA = this.event.params.partyA
		initialQuote.symbolId = this.event.params.symbolId
		initialQuote.positionType = this.event.params.positionType
		initialQuote.requestedOpenPrice = this.event.params.price
		initialQuote.quantity = this.event.params.quantity
		initialQuote.cva = this.event.params.cva
		initialQuote.partyAmm = this.event.params.partyAmm
		initialQuote.partyBmm = this.event.params.partyBmm
		initialQuote.lf = this.event.params.lf
		initialQuote.deadline = this.event.params.deadline
		initialQuote.quoteStatus = 0
		initialQuote.marketPrice = this.event.params.marketPrice

		let symmioContract = symmio.bind(this.event.address)
		let callResultGetQuote = symmioContract.try_getQuote(this.event.params.quoteId)
		if (callResultGetQuote.reverted) {
			log.error('accept cancel bind crashed!', [])
		} else {
			let Result = callResultGetQuote.value as ethereum.Tuple
			let initialNewEntity = initialHelper(Result)
			if (initialNewEntity) {
				quote.maxFundingRate = initialNewEntity.tradingFee
				initialQuote.tradingFee = initialNewEntity.tradingFee
			}
		}

		let callResult = symmioContract.try_symbolNameByQuoteId([this.event.params.quoteId])
		if (callResult.reverted) {
			log.error("error in symbol bind", [])
		} else {
			quote.symbol = callResult.value[0]
			initialQuote.symbol = callResult.value[0]
		}

		if (this.event.params.partyBsWhiteList) {
			let partyBsWhiteList: Bytes[] = []
			for (let i = 0, len = this.event.params.partyBsWhiteList.length; i < len; i++) {
				partyBsWhiteList.push(this.event.params.partyBsWhiteList[i])
			}
			quote.partyBsWhiteList = partyBsWhiteList
			initialQuote.partyBsWhiteList = partyBsWhiteList
		}

		initialQuote.timeStamp = this.event.block.timestamp
		initialQuote.save()

		quote.timeStamp = this.event.block.timestamp
		let EventTimestampEntity = new EventsTimestamp(this.event.params.quoteId.toString())
		quote.eventsTimestamp = EventTimestampEntity.id
		let TransactionsHashEntity = new TransactionsHash(this.event.params.quoteId.toString())
		quote.transactionsHash = TransactionsHashEntity.id
		quote.action = "SendQuote"
		quote.save()

		EventTimestampEntity.SendQuote = this.event.block.timestamp
		EventTimestampEntity.save()
		TransactionsHashEntity.SendQuote = this.event.transaction.hash
		TransactionsHashEntity.save()


	}
}