import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, Bytes, ethereum, log, } from "@graphprotocol/graph-ts"
import { EventsTimestamp, InitialQuote, Quote, TransactionsHash } from "../../../generated/schema"
import { initialQuoteBuilder_0_8_0, initialQuoteBuilder_0_8_2, } from "../../utils/quote&analitics&user"
import { SendQuote as SendQuote_0_8_0 } from "../../../generated/symmio_0_8_0/symmio_0_8_0";
import { SendQuote as SendQuote_0_8_2 } from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import {
	getQuote as getQuote_0_8_2,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_2
} from "../../../common/contract_utils_0_8_2";
import {
	getQuote as getQuote_0_8_0,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_0
} from "../../../common/contract_utils_0_8_0";

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
		quote.lf = event.params.lf
		quote.openDeadline = event.params.deadline
		quote.quoteStatus = 0
		quote.marketPrice = event.params.marketPrice
		quote.averageClosedPrice = BigInt.fromI32(0)
		quote.closedAmount = BigInt.fromI32(0)
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
		initialQuote.lf = event.params.lf
		initialQuote.deadline = event.params.deadline
		initialQuote.quoteStatus = 0
		initialQuote.marketPrice = event.params.marketPrice

		let initialNewEntity: InitialQuote
		let symbolName: string
		switch (version) {
			case Version.v_0_8_3:
			case Version.v_0_8_2: {
				// @ts-ignore
				const e = changetype<SendQuote_0_8_2>(_event)
				quote.partyAmm = e.params.partyAmm
				quote.partyBmm = e.params.partyBmm
				initialQuote.partyAmm = e.params.partyAmm
				initialQuote.partyBmm = e.params.partyBmm
				quote.tradingFee = e.params.tradingFee
				const q = getQuote_0_8_2(event.address, event.params.quoteId)!
				initialNewEntity = initialQuoteBuilder_0_8_2(q)
				symbolName = symbolIdToSymbolName_0_8_2(event.params.symbolId, event.address)
				break
			}
			case Version.v_0_8_0: {
				// @ts-ignore
				const e = changetype<SendQuote_0_8_0>(_event)
				quote.partyAmm = e.params.mm
				quote.partyBmm = e.params.mm
				initialQuote.partyAmm = e.params.mm
				initialQuote.partyBmm = e.params.mm
				quote.tradingFee = BigInt.zero() // Not available in event
				const q = getQuote_0_8_0(event.address, event.params.quoteId)!
				initialNewEntity = initialQuoteBuilder_0_8_0(q)
				symbolName = symbolIdToSymbolName_0_8_0(event.params.symbolId, event.address)
				break
			}
		}
		quote.maxFundingRate = initialNewEntity.tradingFee
		initialQuote.tradingFee = initialNewEntity.tradingFee

		quote.symbol = symbolName!
		initialQuote.symbol = symbolName!

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
		log.debug('event send quote seen. quoteId={}', [quote.quoteId.toString()])

		EventTimestampEntity.SendQuote = event.block.timestamp
		EventTimestampEntity.save()
		TransactionsHashEntity.SendQuote = event.transaction.hash
		TransactionsHashEntity.save()
	}
}