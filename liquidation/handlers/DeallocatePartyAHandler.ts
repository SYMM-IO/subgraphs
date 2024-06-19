
import { DeallocatePartyAHandler as CommonDeallocatePartyAHandler } from "../../common/handlers/DeallocatePartyAHandler"
import { getGlobalCounterAndInc } from "../../common/utils"
import { DeallocatePartyA } from "../../generated/symmio/symmio"
import { ResultPartyA } from "../../parties/generated/schema"

export class DeallocatePartyAHandler extends CommonDeallocatePartyAHandler {

  constructor(event: DeallocatePartyA) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleGlobalCounter()
    const event = super.getEvent()
    let deAllocateEntity = ResultPartyA.load(event.params.user.toHex())
    let globalCounter = getGlobalCounterAndInc()
    if (deAllocateEntity) {
      deAllocateEntity.amount = deAllocateEntity.amount.minus(event.params.amount)
    } else {
      deAllocateEntity = new ResultPartyA(event.params.user.toHex())
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
