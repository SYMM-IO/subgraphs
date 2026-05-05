import { BaseHandler, Version } from "../../BaseHandler"
import { DebugEntity, Quote, SubAccount, VirtualAccount } from "../../../../generated/schema"
import { ethereum, log, BigInt } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../VersionedQuoteLoader"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"

export class OpenPositionHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) {
			log.debug("quote not exist. quoteId {}", [event.params.quoteId.toString()])
			let db = new DebugEntity("OpenPosition-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quoteId ${event.params.quoteId.toString()} not exist`
			db.save()
			return
		}
		quote.globalCounter = super.handleGlobalCounter()
		quote.quoteId = event.params.quoteId
		quote.fillAmount = event.params.filledAmount
		quote.openedPrice = event.params.openedPrice
		quote.quoteStatus = 4
		quote.quantity = event.params.filledAmount
		quote.initialOpenedPrice = event.params.openedPrice

		let data = getQuoteData(version, event.address, event.params.quoteId)
		if (!data) {
			log.debug("getQuoteData null. quoteId {}", [event.params.quoteId.toString()])
			let db = new DebugEntity("OpenPosition-getQuote-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quoteId ${event.params.quoteId.toString()} getQuote problem`
			db.save()
			quote.timestampOpenPosition = _event.block.timestamp
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote, "OpenPosition", _event)
			return
		}

		quote.cva = data.cva
		quote.partyAmm = data.partyAmm
		quote.partyBmm = data.partyBmm
		quote.lf = data.lf
		quote.accumulatedPaidFunding = data.accumulatedPaidFunding
		quote.lastFundingPaymentTimestamp = data.lastFundingPaymentTimestamp
		quote.timestampOpenPosition = _event.block.timestamp
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "OpenPosition", _event)

		if (quote.subAccount) {
			let sub = SubAccount.load(quote.subAccount!)
			if (sub) {
				sub.activePositions = sub.activePositions.plus(BigInt.fromI32(1))
				sub.totalPositions = sub.totalPositions.plus(BigInt.fromI32(1))
				sub.save()
			}
		}
		if (quote.virtualAccount) {
			let va = VirtualAccount.load(quote.virtualAccount!)
			if (va) {
				va.activePositions = va.activePositions.plus(BigInt.fromI32(1))
				va.totalPositions = va.totalPositions.plus(BigInt.fromI32(1))
				va.save()
			}
		}
	}
}
