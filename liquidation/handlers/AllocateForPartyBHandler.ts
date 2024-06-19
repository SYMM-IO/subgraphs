
import { AllocateForPartyBHandler as CommonAllocateForPartyBHandler } from "../../common/handlers/AllocateForPartyBHandler"
import { AllocateForPartyB } from "../../generated/symmio/symmio"
import { ResultPartyB } from "../../parties/generated/schema"

export class AllocateForPartyBHandler extends CommonAllocateForPartyBHandler {

  constructor(event: AllocateForPartyB) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleGlobalCounter()

    let allocateEntity = ResultPartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
    let globalCounter = getGlobalCounterAndInc()
    if (allocateEntity) {
      allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
    } else {
      allocateEntity = new ResultPartyB(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
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
