import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";
import {Account, PriceCheck, Quote, Symbol, TradeHistory} from "../../../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts";
import {unDecimal, updateDailyOpenInterest, updateHistories, UpdateHistoriesParams} from "../../utils/helpers";
import {PRICE_CHECK} from "../../config";

export function handleClose<T>(_event: ethereum.Event, name: string): void {
	// @ts-ignore
	const event = changetype<T>(_event) // FillClose, ForceClose, EmergencyClose all have the same event signature
	let quote = Quote.load(event.params.quoteId.toString())!
	let history = TradeHistory.load(event.params.partyA.toHexString() + "-" + event.params.quoteId.toString())!
	const additionalVolume = event.params.filledAmount.times(event.params.closedPrice).div(BigInt.fromString("10").pow(18))
	history.volume = history.volume.plus(additionalVolume)
	history.updateTimestamp = event.block.timestamp
	history.quoteStatus = quote.quoteStatus
	history.quote = event.params.quoteId
	history.save()

	if (PRICE_CHECK) {
		let priceCheck = new PriceCheck(event.transaction.hash.toHexString() + event.transactionLogIndex.toString())
		priceCheck.event = name
		priceCheck.symbol = Symbol.load(quote.symbolId!.toString())!.name
		priceCheck.givenPrice = event.params.closedPrice
		priceCheck.timestamp = event.block.timestamp
		priceCheck.transaction = event.transaction.hash
		priceCheck.additionalInfo = quote.id
		priceCheck.save()
	}

	let account = Account.load(event.params.partyA.toHexString())!

	const pnl = unDecimal(
		(quote.positionType == 0
				? BigInt.fromString("1")
				: BigInt.fromString("1").neg()
		)
			.times(event.params.closedPrice.minus(quote.openedPrice!))
			.times(event.params.filledAmount),
	)
	let profit = BigInt.zero()
	let loss = BigInt.zero()
	if (pnl.gt(BigInt.zero()))
		profit = pnl
	else
		loss = pnl

	updateHistories(
		new UpdateHistoriesParams(account, event.block.timestamp)
			.closeTradeVolume(additionalVolume)
			.symbolId(quote.symbolId!)
			.loss(loss)
			.profit(profit)
	)

	updateDailyOpenInterest(event.block.timestamp, unDecimal(event.params.filledAmount.times(quote.openedPrice!)), false, account.accountSource)
}