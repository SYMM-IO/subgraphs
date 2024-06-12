import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { LiquidatePositionsPartyA } from "../../generated/symmio/symmio"
import { Account, Quote, QuoteFundingDetails } from "../../generated/schema"
import { QuoteStatus, getDailyHistoryForTimestamp, getTotalHistory, unDecimal } from "../utils"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"
import { getQuote } from "../../common/utils"

export function handleLiquidatePosition(_event: ethereum.Event, qId: BigInt, eventName: string): void {
    const event = changetype<LiquidatePositionsPartyA>(_event)
    const quote = Quote.load(qId.toString())!
    quote.quoteStatus = QuoteStatus.LIQUIDATED
    quote.save()
    setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, eventName, event.transaction.hash, event.block.number)
    const chainQuote = getQuote(qId, event.address)
    if (chainQuote == null) return
    const liquidAmount = quote.quantity!.minus(quote.closedAmount!)
    const liquidPrice = chainQuote.avgClosedPrice
        .times(quote.quantity!)
        .minus(quote.averageClosedPrice!.times(quote.closedAmount!))
        .div(liquidAmount)
    const additionalVolume = liquidAmount
        .times(liquidPrice)
        .div(BigInt.fromString("10").pow(18))

    quote.averageClosedPrice = chainQuote.avgClosedPrice
    const pnl = unDecimal(
        (quote.positionType == 0
            ? BigInt.fromString("1")
            : BigInt.fromString("1").neg()
        )
            .times(liquidPrice.minus(quote.openedPrice!))
            .times(liquidAmount),
    )
    quote.save()
    let quoteFundingDetails = QuoteFundingDetails.load(quote.id)!
    quoteFundingDetails.pnl = quoteFundingDetails.pnl.plus(pnl)
    quoteFundingDetails.save()

    let account = Account.load(quote.partyA.toHexString())!

    const dh = getDailyHistoryForTimestamp(
        event.block.timestamp,
        event.params.partyA,
        account.accountSource,
    )
    dh.closeTradeVolume = dh.closeTradeVolume.plus(additionalVolume)
    if (pnl.gt(BigInt.zero())) dh.profit = dh.profit.plus(pnl)
    else dh.loss = dh.loss.plus(pnl)
    dh.updateTimestamp = event.block.timestamp
    dh.save()

    const th = getTotalHistory(
        event.block.timestamp,
        event.params.partyA,
        account.accountSource,
    )
    th.closeTradeVolume = th.closeTradeVolume.plus(additionalVolume)
    if (pnl.gt(BigInt.zero())) th.profit = th.profit.plus(pnl)
    else th.loss = th.loss.plus(pnl)
    th.updateTimestamp = event.block.timestamp
    th.save()
}