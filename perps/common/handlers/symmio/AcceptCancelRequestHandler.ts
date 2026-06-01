import { Account, Quote } from "../../../../generated/schema"
import { BaseHandler, Version } from "../../BaseHandler"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData, getSymbolName } from "../../VersionedQuoteLoader"
import { updateActivityTimestamps } from "../../../analytics/utils/activityHelpers"
import { updateHistories, UpdateHistoriesParams } from "../../../analytics/utils/historyHelpers"
import { catchUpHistories } from "../../../analytics/utils/openInterestHelpers"
import { QuoteStatus } from "../../../analytics/utils/constants"
import { updateQuoteHierarchyCounters } from "../../utils/profile"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../../analytics/utils/historyHelpers"

export class AcceptCancelRequestHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) {
			quote = new Quote(event.params.quoteId.toString() + "-" + event.address.toHexString())
			quote.globalCounter = super.handleGlobalCounter()
			quote.source = event.address
			quote.quoteId = event.params.quoteId
			quote.timestamp = event.block.timestamp
			quote.timestampSendQuote = event.block.timestamp

			const q = getQuoteData(version, event.address, event.params.quoteId)
			if (!q) {
				quote.blockNumber = event.block.number
				quote.quoteStatus = event.params.quoteStatus
				quote.partyA = event.address
				quote.partyAAccount = event.address.toHexString()
				quote.tradingFee = BigInt.zero()
				quote.closeFee = BigInt.zero()
				quote.initialCva = BigInt.zero()
				quote.initialPartyBmm = BigInt.zero()
				quote.initialLf = BigInt.zero()
				quote.save()
				setEventTimestampAndTransactionHashAndAction(quote, "AcceptCancelRequest", _event)
				return
			}

			quote.orderTypeOpen = q.orderType
			quote.partyA = q.partyA
			quote.partyAAccount = q.partyA.toHexString()
			quote.symbolId = q.symbolId
			quote.positionType = q.positionType
			quote.requestedOpenPrice = q.requestedOpenPrice
			quote.quantity = q.quantity
			quote.cva = q.cva
			quote.lf = q.lf
			quote.initialCva = q.cva
			quote.initialLf = q.lf
			quote.initialPartyAmm = q.partyAmm
			quote.initialPartyBmm = q.partyBmm
			quote.partyAmm = q.partyAmm
			quote.partyBmm = q.partyBmm
			quote.openDeadline = q.deadline
			quote.quoteStatus = q.quoteStatus
			quote.marketPrice = q.marketPrice
			quote.partyBsWhiteList = q.partyBsWhiteList

			if (version == Version.v_0_8_0) {
				quote.tradingFee = BigInt.zero()
			} else {
				quote.maxFundingRate = q.maxFundingRate
				quote.tradingFee = q.tradingFee
			}
			quote.closeFee = q.closeFee

			if (version >= Version.v_0_8_3) {
				quote.affiliate = q.affiliate
			}

			quote.symbol = getSymbolName(version, q.symbolId, event.address)

			let account = Account.load(quote.partyA.toHexString())
			if (!account) {
				account = createNewAccountIfNotExists(quote.partyA, quote.partyA, null, AccountType.UNKNOWN, event.block, event.transaction)
				account.source = event.address
			}
			updateActivityTimestamps(account, event.block.timestamp, event.address)

			updateHistories(new UpdateHistoriesParams(version, account, null, event).quotesCount(BigInt.fromString("1")))
			catchUpHistories(_event.block.timestamp, event.address)
		}
		quote.globalCounter = super.handleGlobalCounter()
		quote.blockNumber = event.block.number
		if (event.params.quoteStatus == QuoteStatus.CANCELED) {
			updateQuoteHierarchyCounters(
				quote,
				BigInt.fromI32(-1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.fromI32(1),
				BigInt.zero(),
				BigInt.zero(),
				_event.block.timestamp,
			)
			updateQuoteBucketHierarchyHistoriesForQuote(
				quote,
				_event.block.timestamp,
				BigInt.fromI32(-1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.fromI32(1),
				BigInt.zero(),
				BigInt.zero(),
			)
		}
		quote.quoteStatus = event.params.quoteStatus
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "AcceptCancelRequest", _event)
	}
}
