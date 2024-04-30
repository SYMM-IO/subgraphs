
import { OpenPositionHandler as CommonOpenPositionHandler } from "../../common/handlers/OpenPositionHandler"
import { getGlobalCounterAndInc } from "../../common/helper"
import { PartyA, PartyBPartyA } from "../../generated/schema"
import { OpenPosition } from "../../generated/symmio/symmio"

export class OpenPositionHandler extends CommonOpenPositionHandler {

  constructor(event: OpenPosition) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleQuote()
    let partyAEntity = PartyA.load(this.event.params.partyA.toHexString())!
    partyAEntity.globalCounter = getGlobalCounterAndInc()
    let temp = partyAEntity.quoteUntilLiquid!.slice(0)
    const indexA = temp.indexOf(this.event.params.quoteId)
    const removedPa = temp.splice(indexA, 1)
    partyAEntity.quoteUntilLiquid = temp.slice(0)
    partyAEntity.save()
    let partyAPartyBEntity = PartyBPartyA.load(this.event.params.partyA.toHexString() + '-' + this.event.params.partyB.toHexString())!
    partyAPartyBEntity.globalCounter = getGlobalCounterAndInc()
    temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
    const indexB = temp.indexOf(this.event.params.quoteId)
    const removedPb = temp.splice(indexB, 1)
    partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)

    partyAPartyBEntity.save()
  }
}
