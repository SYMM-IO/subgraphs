import { TradingFeeChargedHandler as CommonTradingFeeChargedHandler } from "../../../common/handlers/symmio/TradingFeeChargedHandler"
import { Account, Quote } from "../../../../generated/schema"
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"

export class TradingFeeChargedHandler<T> extends CommonTradingFeeChargedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		accumulateQuoteFee<T>(_event)

		let account = Account.load(event.params.partyA.toHexString())
		if (!account) return
		let solverAccount = Account.load(event.params.partyB.toHexString())

		let params = new UpdateHistoriesParams(version, account, solverAccount, event).symbolId(event.params.symbolId).symbolTradesCount(BigInt.zero())

		if (event.params._type == 0) params.openFee(event.params.amount)
		else params.closeFee(event.params.amount)

		updateHistories(params)
	}
}

function accumulateQuoteFee<T>(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	let id = event.params.quoteId.toString() + "-" + event.address.toHexString()
	let quote = Quote.load(id)
	if (!quote) {
		log.warning("Cannot record trading fee for missing quote {} at {}-{}", [id, event.transaction.hash.toHexString(), event.logIndex.toString()])
		return
	}
	quote.feeAffiliate = event.params.affiliate
	if (event.params._type == 0) {
		let paid = quote.paidOpenFee
		if (paid !== null) quote.paidOpenFee = paid.plus(event.params.amount)
		else quote.paidOpenFee = event.params.amount
	} else {
		let paid = quote.paidCloseFee
		let closed = quote.closedAmount
		// The core charges the close fee before the close event updates closedAmount,
		// so a non-zero amount here means earlier closes happened without fee events.
		if (paid !== null) quote.paidCloseFee = paid.plus(event.params.amount)
		else if (closed === null || closed.isZero()) quote.paidCloseFee = event.params.amount
	}
	quote.save()
}
