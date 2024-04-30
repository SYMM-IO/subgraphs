
import { SendQuoteHandler as CommonSendQuoteHandler } from "../../common/handlers/SendQuoteHandler"
import { PartyA } from "../../generated/schema"
import { SendQuote } from "../../generated/symmio/symmio"

export class SendQuoteHandler extends CommonSendQuoteHandler {

  constructor(event: SendQuote) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleQuote()

    let partyAEntity = PartyA.load(this.event.params.partyA.toHexString())
    if (!partyAEntity) {
      partyAEntity = new PartyA(this.event.params.partyA.toHexString())
      partyAEntity.quoteUntilLiquid = [this.event.params.quoteId]
    } else {
      let temp = partyAEntity.quoteUntilLiquid!.slice(0)
      temp.push(this.event.params.quoteId)

      partyAEntity.quoteUntilLiquid = temp.slice(0)
    }
  }
}
