
import { log } from "@graphprotocol/graph-ts"
import { ExpireQuoteHandler as CommonExpireQuoteHandler } from "../../common/handlers/ExpireQuoteHandler"
import { getGlobalCounterAndInc } from "../../common/helper"
import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { ExpireQuote } from "../../generated/symmio/symmio"

export class ExpireQuoteHandler extends CommonExpireQuoteHandler {

  constructor(event: ExpireQuote) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleQuote()
    let entity = Quote.load(this.event.params.quoteId.toString())!
    if (entity.quoteStatus === 0) {
      let partyAEntity = PartyA.load(entity.partyA.toHexString())!
      partyAEntity.globalCounter = getGlobalCounterAndInc()
      let temp = partyAEntity.quoteUntilLiquid!.slice(0)
      const indexA = temp.indexOf(this.event.params.quoteId)
      const removedPa = temp.splice(indexA, 1)
      partyAEntity.quoteUntilLiquid = temp.slice(0)
      partyAEntity.save()
    } else if (entity.quoteStatus === 1) {
      let partyAPartyBEntity = PartyBPartyA.load(entity.partyA.toHexString() + '-' + entity.partyB!.toHexString())!
      partyAPartyBEntity.globalCounter = getGlobalCounterAndInc()
      let temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
      const indexB = temp.indexOf(this.event.params.quoteId)
      const removedPb = temp.splice(indexB, 1)
      partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
      log.debug(`remove in expire quote party B = ${removedPb}\nnew list: ${temp.toString()} remove index: ${indexB}`, [])
    }
  }
}
