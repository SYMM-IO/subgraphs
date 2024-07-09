
import { DeallocatePartyAHandler as CommonDeallocatePartyAHandler } from "../../common/handlers/DeallocatePartyAHandler"
import { getGlobalCounterAndInc } from "../../common/utils"
import { PartyA } from "../../generated/schema"
import { DeallocatePartyA } from "../../generated/symmio/symmio"

export class DeallocatePartyAHandler extends CommonDeallocatePartyAHandler {

  constructor(event: DeallocatePartyA) {
    super(event)
  }

  handle(): void {
    super.handle(_event, version)
    super.handleGlobalCounter()
    const event = super.getEvent()
    let deAllocateEntity = PartyA.load(event.params.user.toHex())
    let globalCounter = getGlobalCounterAndInc()
    if (deAllocateEntity) {
      deAllocateEntity.amount = deAllocateEntity.amount.minus(event.params.amount)
    } else {
      deAllocateEntity = new PartyA(event.params.user.toHex())
      deAllocateEntity.index = globalCounter
      deAllocateEntity.partyA = event.params.user
      deAllocateEntity.amount = event.params.amount
    }
    deAllocateEntity.timeStamp = event.block.timestamp
    deAllocateEntity.trHash = event.transaction.hash
    deAllocateEntity.blockNumber = event.block.number
    deAllocateEntity.GlobalCounter = globalCounter
    deAllocateEntity.save()
  }
}
