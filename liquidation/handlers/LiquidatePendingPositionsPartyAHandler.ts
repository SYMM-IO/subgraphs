
import { LiquidatePendingPositionsPartyAHandler as CommonLiquidatePendingPositionsPartyAHandler } from "../../common/handlers/LiquidatePendingPositionsPartyAHandler"
import { allocatedBalanceOfPartyA } from "../../common/utils"
import { getGlobalCounterAndInc } from '../../common/utils'
import { LiquidTransaction, PartyA } from "../../generated/schema"
import { LiquidatePendingPositionsPartyA } from "../../generated/symmio/symmio"

export class LiquidatePendingPositionsPartyAHandler extends CommonLiquidatePendingPositionsPartyAHandler {

  constructor(event: LiquidatePendingPositionsPartyA) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleGlobalCounter()
    let event = super.getEvent()

    let partyAEntity = PartyA.load(event.params.partyA.toHexString())!

    partyAEntity.GlobalCounter = getGlobalCounterAndInc()
    const list = partyAEntity.quoteUntilLiquid!.slice(0)

    let liquidTrEntity = new LiquidTransaction(event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toHexString()))
    liquidTrEntity.GlobalCounter = getGlobalCounterAndInc()
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
    partyAEntity.quoteUntilLiquid = []
    partyAEntity.save()
  }

}
