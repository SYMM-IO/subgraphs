
import { AllocateForPartyBHandler as CommonAllocateForPartyBHandler } from "../../common/handlers/AllocateForPartyBHandler"
import { getGlobalCounterAndInc } from "../../common/utils"
import { PartyB } from "../../generated/schema"
import { AllocateForPartyB } from "../../generated/symmio/symmio"

export class AllocateForPartyBHandler extends CommonAllocateForPartyBHandler {

  constructor(event: AllocateForPartyB) {
    super(event)
  }

  handle(): void {
    super.handle()
    const globalCounter = super.handleGlobalCounter()
    const event = super.getEvent()
    let allocateEntity = PartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
    if (allocateEntity) {
      allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
    } else {
      allocateEntity = new PartyB(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
      allocateEntity.index = globalCounter
      allocateEntity.amount = event.params.amount
      allocateEntity.partyA = event.params.partyA
      allocateEntity.partyB = event.params.partyB
    }
    allocateEntity.timeStamp = event.block.timestamp
    allocateEntity.trHash = event.transaction.hash
    allocateEntity.blockNumber = event.block.number
    allocateEntity.GlobalCounter = globalCounter
    allocateEntity.save()
  }
}
