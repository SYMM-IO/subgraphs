import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { SendQuoteHandler as CommonSendQuoteHandler } from "../../common/handlers/SendQuoteHandler"
import { Account, Quote, QuoteFundingDetails } from "../../generated/schema"
import { SendQuote } from "../../generated/symmio/symmio"
import { QuoteStatus, getConfiguration, getDailyHistoryForTimestamp, getTotalHistory } from "../utils"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"

export class SendQuoteHandler extends CommonSendQuoteHandler {

	constructor(event: SendQuote) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
		let event = super.getEvent()

		let account = Account.load(event.params.partyA.toHexString())!
		account.quotesCount = account.quotesCount.plus(BigInt.fromString("1"))
		account.save()
		let quote = new Quote(event.params.quoteId.toString())
		quote.timeStamp = event.block.timestamp
		quote.blockNumber = event.block.number
		if (event.params.partyBsWhiteList) {
			let partyBsWhiteList: Bytes[] = []
			for (let i = 0, len = event.params.partyBsWhiteList.length; i < len; i++)
				partyBsWhiteList.push(event.params.partyBsWhiteList[i])
			quote.partyBsWhiteList = partyBsWhiteList
		}
		quote.symbolId = event.params.symbolId
		quote.positionType = event.params.positionType
		quote.orderTypeOpen = event.params.orderType
		quote.requestedOpenPrice = event.params.price
		quote.marketPrice = event.params.marketPrice
		quote.openDeadline = event.params.deadline
		quote.quantity = event.params.quantity
		quote.cva = event.params.cva
		quote.partyAmm = event.params.partyAmm
		quote.partyBmm = event.params.partyBmm
		quote.lf = event.params.lf
		quote.quoteStatus = QuoteStatus.PENDING
		quote.partyA = Bytes.fromHexString(account.id)
		quote.closedAmount = BigInt.zero()
		quote.averageClosedPrice = BigInt.zero()
		quote.save()

		let quoteFundingDetails = new QuoteFundingDetails(quote.id)
		quoteFundingDetails.pnl = BigInt.zero()
		quoteFundingDetails.fundingPaid = BigInt.zero()
		quoteFundingDetails.fundingReceived = BigInt.zero()
		quoteFundingDetails.collateral = getConfiguration(event).collateral
		quoteFundingDetails.save()


		const dh = getDailyHistoryForTimestamp(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
		)
		dh.quotesCount = dh.quotesCount.plus(BigInt.fromString("1"))
		dh.updateTimestamp = event.block.timestamp
		dh.save()
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "SendQuote", event.transaction.hash, event.block.number)

		const th = getTotalHistory(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
		)
		th.quotesCount = th.quotesCount.plus(BigInt.fromString("1"))
		th.updateTimestamp = event.block.timestamp
		th.save()
	}
}
