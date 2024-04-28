
import { log } from "@graphprotocol/graph-ts"
import { LiquidatePositionsPartyAHandler as CommonLiquidatePositionsPartyAHandler } from "../../common/handlers/LiquidatePositionsPartyAHandler"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../../common/helper"
import { PartyASymbolPrice, Quote } from "../../generated/schema"
import { LiquidatePositionsPartyA } from "../../generated/symmio/symmio"

export class LiquidatePositionsPartyAHandler extends CommonLiquidatePositionsPartyAHandler {

  constructor(event: LiquidatePositionsPartyA) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleQuote()

    for (let i = 0, lenQ = this.event.params.quoteIds.length; i < lenQ; i++) {
      let qoutId = this.event.params.quoteIds[i]
      let quote = Quote.load(qoutId.toString())!
      quote.globalCounter = getGlobalCounterAndInc()
      quote.timeStamp = this.event.block.timestamp
      quote.quoteStatus = 8
      let LiquidateAmount = quote.quantity!.minus(quote.closedAmount!)
      quote.liquidateAmount = LiquidateAmount
      let partyASymbolPriceEntity = PartyASymbolPrice.load(this.event.params.partyA.toHexString().concat('-').concat(quote.symbolId!.toHex()))
      if (partyASymbolPriceEntity) {
        quote.liquidatePrice = partyASymbolPriceEntity.requestedOpenPrice
      } else {
        log.debug(`Error in get entity liquidate requestedOpenPrice`, [])
      }
      setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
        'LiquidatePositionsPartyA', this.event.transaction.hash)
      quote.save()
    }
  }
}
