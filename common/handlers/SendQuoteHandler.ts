import { BaseHandler } from "./BaseHandler"
import { SendQuote, symmio } from "../../generated/symmio/symmio"
import { BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import { Account, EventsTimestamp, InitialQuote, Quote, TransactionsHash } from "../../generated/schema"
import { initialHelper, setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { getGlobalCounterAndInc, getQuote, symbolIdToSymbolName } from "../utils"

export class SendQuoteHandler extends BaseHandler {
	protected event: SendQuote

	constructor(event: SendQuote) {
		super(event)
		this.event = event
	}

	protected getEvent(): SendQuote {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
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
		quote.fundingRateFee = BigInt.fromI32(0)
		quote.blockNumber = this.event.block.number
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


		const getQuoteValue = getQuote(this.event.params.quoteId, this.event.address)
		let initialNewEntity = initialHelper(getQuoteValue)
		quote.maxFundingRate = initialNewEntity.tradingFee
		initialQuote.tradingFee = initialNewEntity.tradingFee


		const symbolName = symbolIdToSymbolName(this.event.params.symbolId, this.event.address)
		quote.symbol = symbolName
		initialQuote.symbol = symbolName


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
		quote.eventsTimestamp = this.event.params.quoteId.toString()
		let TransactionsHashEntity = new TransactionsHash(this.event.params.quoteId.toString())
		quote.transactionsHash = this.event.params.quoteId.toString()
		quote.action = "SendQuote"
		quote.save()

		EventTimestampEntity.SendQuote = this.event.block.timestamp
		EventTimestampEntity.save()
		TransactionsHashEntity.SendQuote = this.event.transaction.hash
		TransactionsHashEntity.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'SendQuote', this.event.transaction.hash)
	}

	handleAccount(): void {
		super.handleAccount()
		let event = this.getEvent()
		let account = Account.load(event.params.partyA.toHexString())!
		account.quotesCount = account.quotesCount.plus(BigInt.fromString("1"))
		account.save()
	}
}