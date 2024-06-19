
import { AllocatePartyAHandler as CommonAllocatePartyAHandler } from "../../common/handlers/AllocatePartyAHandler"
import { getGlobalCounterAndInc } from "../../common/utils"
import { PartyA } from "../../generated/schema"
import { AllocatePartyA } from "../../generated/symmio/symmio"

export class AllocatePartyAHandler extends CommonAllocatePartyAHandler {

  constructor(event: AllocatePartyA) {
    super(event)
  }

  handle(): void {
    super.handle()
    const event = super.getEvent()
    super.handleGlobalCounter()
    let allocateEntity = PartyA.load(event.params.user.toHex())
    let globalCounter = getGlobalCounterAndInc()
    if (allocateEntity) {

      allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
    } else {
      allocateEntity = new ResultPartyA(event.params.user.toHex())
      allocateEntity.index = globalCounter
      allocateEntity.partyA = event.params.user
      allocateEntity.amount = event.params.amount
    }
    allocateEntity.timeStamp = event.block.timestamp
    allocateEntity.trHash = event.transaction.hash
    allocateEntity.blockNumber = event.block.number
    allocateEntity.GlobalCounter = globalCounter
    allocateEntity.save()
  }
}
