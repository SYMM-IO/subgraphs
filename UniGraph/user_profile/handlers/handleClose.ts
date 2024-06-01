import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { FillCloseRequest } from "../../generated/symmio/symmio"
import { Account, Quote, QuoteFundingDetails } from "../../generated/schema"
import { QuoteStatus, getDailyHistoryForTimestamp, getTotalHistory, unDecimal } from "../utils"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/helper"


export function handleClose(_event: ethereum.Event, eventName: string): void {
    const event = changetype<FillCloseRequest>(_event) // FillClose, ForceClose, EmergencyClose all have the same event signature

    let quote = Quote.load(event.params.quoteId.toString())!
    quote.averageClosedPrice = quote.averageClosedPrice!
        .times(quote.closedAmount!)
        .plus(event.params.filledAmount.times(event.params.closedPrice))
        .div(quote.closedAmount!.plus(event.params.filledAmount))
    quote.closedAmount = quote.closedAmount!.plus(event.params.filledAmount)
    if (quote.closedAmount!.equals(quote.quantity!))
        quote.quoteStatus = QuoteStatus.CLOSED
    setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, eventName, event.transaction.hash)

    const pnl = unDecimal(
        (quote.positionType == 0
            ? BigInt.fromString("1")
            : BigInt.fromString("1").neg()
        )
            .times(event.params.closedPrice.minus(quote.openedPrice!))
            .times(event.params.filledAmount),
    )
    quote.save()

    let quoteFundingDetails = QuoteFundingDetails.load(quote.id)!
    quoteFundingDetails.pnl = quoteFundingDetails.pnl.plus(pnl)
    quoteFundingDetails.save()

    const additionalVolume = event.params.filledAmount
        .times(event.params.closedPrice)
        .div(BigInt.fromString("10").pow(18))

    let account = Account.load(event.params.partyA.toHexString())!

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

