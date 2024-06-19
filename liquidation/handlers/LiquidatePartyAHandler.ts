
import { LiquidatePartyAHandler as CommonLiquidatePartyAHandler } from "../../common/handlers/LiquidatePartyAHandler"
import { LiquidatePartyA } from "../../generated/symmio/symmio"
import { LiquidTransaction, PartyA } from "../../generated/schema"
import { allocatedBalanceOfPartyA } from "../../common/utils"
import { getGlobalCounterAndInc } from '../../common/utils'

export class LiquidatePartyAHandler extends CommonLiquidatePartyAHandler {

  constructor(event: LiquidatePartyA) {
    super(event)
  }

  handle(): void {
    super.handle()
    const globalCounter = super.handleGlobalCounter()
    let event = super.getEvent()
    let partyAEntity = PartyA.load(event.params.partyA.toHexString())
    if (partyAEntity) {
      partyAEntity.globalCounter = globalCounter
      const list = partyAEntity.quoteUntilLiquid!.slice(0)

      let liquidTrEntity = new LiquidTransaction(event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toHexString()))
      liquidTrEntity.GlobalCounter = globalCounter
      liquidTrEntity.mode = "Pending"
      const balance = allocatedBalanceOfPartyA(event.params.partyA, event.address)
      if (balance) {
        liquidTrEntity.balance = balance
      }
      liquidTrEntity.pendigQuoteLiquidateList = list
      liquidTrEntity.listLenght = list.length
      liquidTrEntity.partyA = event.params.partyA
      liquidTrEntity.timeStamp = event.block.timestamp
      liquidTrEntity.save()
      partyAEntity.save()
    }
  }
}
