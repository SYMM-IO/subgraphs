
import { AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler } from "../../common/handlers/AcceptCancelRequestHandler"
import { getGlobalCounterAndInc } from "../../common/helper"
import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { AcceptCancelRequest } from "../../generated/symmio/symmio"

export class AcceptCancelRequestHandler extends CommonAcceptCancelRequestHandler {

  constructor(event: AcceptCancelRequest) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleQuote()
    let quote = Quote.load(this.event.params.quoteId.toString())
    if (quote) {

      let partyAEntity = PartyA.load(quote.partyA.toHexString())!
      partyAEntity.globalCounter = getGlobalCounterAndInc()
      let temp = partyAEntity.quoteUntilLiquid!.slice(0)
      const indexA = temp.indexOf(this.event.params.quoteId)
      const removedPa = temp.splice(indexA, 1)
      partyAEntity.quoteUntilLiquid = temp.slice(0)
      partyAEntity.save()
      let partyAPartyBEntity = PartyBPartyA.load(quote.partyA.toHexString() + '-' + quote.partyB!.toHexString())!
      partyAPartyBEntity.globalCounter = getGlobalCounterAndInc()
      temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
      const indexB = temp.indexOf(this.event.params.quoteId)
      const removedPb = temp.splice(indexB, 1)
      partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)

      partyAPartyBEntity.save()
    }
  }
}
