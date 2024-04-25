
import { log } from "@graphprotocol/graph-ts"
import { LiquidatePendingPositionsPartyAHandler as CommonLiquidatePendingPositionsPartyAHandler } from "../../common/handlers/LiquidatePendingPositionsPartyAHandler"
import { getGlobalCounterAndInc } from "../../common/helper"
import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { LiquidatePendingPositionsPartyA } from "../../generated/symmio/symmio"

export class LiquidatePendingPositionsPartyAHandler extends CommonLiquidatePendingPositionsPartyAHandler {

  constructor(event: LiquidatePendingPositionsPartyA) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleQuote()

    let partyAEntity = PartyA.load(this.event.params.partyA.toHexString())!
    partyAEntity.globalCounter = getGlobalCounterAndInc()
    const list = partyAEntity.quoteUntilLiquid!.slice(0)
    for (let i = 0, lenQ = list.length; i < lenQ; i++) {
      const quoteId = list[i]
      let pendingEntity = Quote.load(quoteId.toString())!
      pendingEntity.globalCounter = getGlobalCounterAndInc()
      if (pendingEntity.quoteStatus <= 2 && pendingEntity.quoteStatus >= 0) {
        pendingEntity.quoteStatus = 8
        pendingEntity.save()
        if (pendingEntity.partyB) {
          let partyAPartyBEntity = PartyBPartyA.load(this.event.params.partyA.toHexString() + '-' + pendingEntity.partyB!.toHexString())!
          partyAPartyBEntity.globalCounter = getGlobalCounterAndInc()
          partyAPartyBEntity.quoteUntilLiquid = []
          partyAPartyBEntity.save()
        }
      } else {
        log.error(`error in liquidate positions party A\nQuoteId: ${quoteId}\nQuote status: ${pendingEntity.quoteStatus}`, [])
      }
    }
  }
}
