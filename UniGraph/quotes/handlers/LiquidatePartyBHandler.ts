
import { log } from "@graphprotocol/graph-ts"
import { LiquidatePartyBHandler as CommonLiquidatePartyBHandler } from "../../common/handlers/LiquidatePartyBHandler"
import { getGlobalCounterAndInc } from "../../common/helper"
import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { LiquidatePartyB } from "../../generated/symmio/symmio"

export class LiquidatePartyBHandler extends CommonLiquidatePartyBHandler {

  constructor(event: LiquidatePartyB) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleQuote()

    let partyBpartyA = PartyBPartyA.load(this.event.params.partyA.toHexString() + '-' + this.event.params.partyB.toHexString())!
    const list = partyBpartyA.quoteUntilLiquid!.slice(0)
    partyBpartyA.globalCounter = getGlobalCounterAndInc()
    for (let i = 0, lenQ = list.length; i < lenQ; i++) {
      const quoteId = list[i]
      let entity = Quote.load(quoteId.toString())!
      if (entity.quoteStatus <= 2 && entity.quoteStatus >= 0) {
        entity.quoteStatus = 8
        entity.globalCounter = getGlobalCounterAndInc()
        entity.save()
      } else {
        log.error(`error in liquidate positions party B\nQuoteId: ${quoteId}\nQuote status: ${entity.quoteStatus}`, [])
      }
    }
    let partyA = PartyA.load(this.event.params.partyA.toHexString())!
    partyA.globalCounter = getGlobalCounterAndInc()
    partyBpartyA.quoteUntilLiquid = []
    partyA.quoteUntilLiquid = []
    partyA.save()
    partyBpartyA.save()

  }
}
