import {BaseHandler, Version} from "../BaseHandler"
import {BigInt, Bytes, ethereum,} from "@graphprotocol/graph-ts"
import {EventsTimestamp, InitialQuote, Quote, TransactionsHash} from "../../generated/schema"
import {initialHelper,} from "../utils/quote&analitics&user"
import {getQuote, symbolIdToSymbolName} from "../utils"

export class SendQuoteHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = new Quote(event.params.quoteId.toString())
		quote.globalCounter = super.handleGlobalCounter()
		quote.quoteId = event.params.quoteId
		quote.orderTypeOpen = event.params.orderType
		quote.partyA = event.params.partyA
		quote.symbolId = event.params.symbolId
		quote.positionType = event.params.positionType
		quote.requestedOpenPrice = event.params.price
		quote.quantity = event.params.quantity
		quote.cva = event.params.cva
		quote.partyAmm = event.params.partyAmm
		quote.partyBmm = event.params.partyBmm
		quote.lf = event.params.lf
		quote.openDeadline = event.params.deadline
		quote.quoteStatus = 0
		quote.marketPrice = event.params.marketPrice
		quote.averageClosedPrice = BigInt.fromI32(0)
		quote.closedAmount = BigInt.fromI32(0)
		quote.tradingFee = event.params.tradingFee
		quote.fundingRateFee = BigInt.fromI32(0)
		quote.blockNumber = event.block.number
		let initialQuote = new InitialQuote(event.params.quoteId.toString())
		quote.initialData = initialQuote.id
		initialQuote.quoteId = event.params.quoteId
		initialQuote.orderTypeOpen = event.params.orderType
		initialQuote.partyA = event.params.partyA
		initialQuote.symbolId = event.params.symbolId
		initialQuote.positionType = event.params.positionType
		initialQuote.requestedOpenPrice = event.params.price
		initialQuote.quantity = event.params.quantity
		initialQuote.cva = event.params.cva
		initialQuote.partyAmm = event.params.partyAmm
		initialQuote.partyBmm = event.params.partyBmm
		initialQuote.lf = event.params.lf
		initialQuote.deadline = event.params.deadline
		initialQuote.quoteStatus = 0
		initialQuote.marketPrice = event.params.marketPrice

		const getQuoteValue = getQuote(event.params.quoteId, event.address)
		let initialNewEntity = initialHelper(getQuoteValue)
		quote.maxFundingRate = initialNewEntity.tradingFee
		initialQuote.tradingFee = initialNewEntity.tradingFee

		const symbolName = symbolIdToSymbolName(event.params.symbolId, event.address)
		quote.symbol = symbolName
		initialQuote.symbol = symbolName

		if (event.params.partyBsWhiteList) {
			let partyBsWhiteList: Bytes[] = []
			for (let i = 0, len = event.params.partyBsWhiteList.length; i < len; i++) {
				partyBsWhiteList.push(event.params.partyBsWhiteList[i])
			}
			quote.partyBsWhiteList = partyBsWhiteList
			initialQuote.partyBsWhiteList = partyBsWhiteList
		}

		initialQuote.timeStamp = event.block.timestamp
		initialQuote.save()

		quote.timeStamp = event.block.timestamp
		let EventTimestampEntity = new EventsTimestamp(event.params.quoteId.toString())
		quote.eventsTimestamp = event.params.quoteId.toString()
		let TransactionsHashEntity = new TransactionsHash(event.params.quoteId.toString())
		quote.transactionsHash = event.params.quoteId.toString()
		quote.action = "SendQuote"
		quote.save()

		EventTimestampEntity.SendQuote = event.block.timestamp
		EventTimestampEntity.save()
		TransactionsHashEntity.SendQuote = event.transaction.hash
		TransactionsHashEntity.save()
	}
}