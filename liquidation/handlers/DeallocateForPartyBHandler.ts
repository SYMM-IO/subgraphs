
import { DeallocateForPartyBHandler as CommonDeallocateForPartyBHandler } from "../../common/handlers/DeallocateForPartyBHandler"
import { PartyB } from "../../generated/schema"
import { DeallocateForPartyB } from "../../generated/symmio/symmio"

export class DeallocateForPartyBHandler extends CommonDeallocateForPartyBHandler {

  constructor(event: DeallocateForPartyB) {
    super(event)
  }

  handle(): void {
    super.handle(_event, version)
    const globalCounter = super.handleGlobalCounter()
    const event = super.getEvent()
    let deAllocateEntity = PartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())!

    deAllocateEntity.amount = deAllocateEntity.amount.minus(event.params.amount)
    deAllocateEntity.timeStamp = event.block.timestamp
    deAllocateEntity.trHash = event.transaction.hash
    deAllocateEntity.blockNumber = event.block.number
    deAllocateEntity.GlobalCounter = globalCounter
    deAllocateEntity.save()
  }
}
