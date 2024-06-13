
import { LiquidatePartyBHandler as CommonLiquidatePartyBHandler } from "../../common/handlers/LiquidatePartyBHandler"
import { allocatedBalanceOfPartyB, getGlobalCounterAndInc } from '../../common/utils'
import { LiquidTransaction, PartyA, PartyApartyB } from "../../generated/schema"
import { LiquidatePartyB } from "../../generated/symmio/symmio"

export class LiquidatePartyBHandler extends CommonLiquidatePartyBHandler {

  constructor(event: LiquidatePartyB) {
    super(event)
  }

  handle(): void {
    super.handle()
    const globalCounter = super.handleGlobalCounter()
    let event = super.getEvent()
    let partyAPartyBEntity = PartyApartyB.load(event.params.partyA.toHexString() + '-' + event.params.partyB.toHexString())!
    const list = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
    partyAPartyBEntity.GlobalCounter = getGlobalCounterAndInc()

    let liquidTrEntity = new LiquidTransaction(event.transaction.hash.toHexString())
    liquidTrEntity.GlobalCounter = getGlobalCounterAndInc()
    liquidTrEntity.mode = "PartyB"
    const balance = allocatedBalanceOfPartyB(event.params.partyB, event.params.partyA, event.address)
    if (balance) {
      liquidTrEntity.balance = balance
    }
    liquidTrEntity.pendigQuoteLiquidateList = list
    liquidTrEntity.listLenght = list.length
    liquidTrEntity.partyA = event.params.partyA
    liquidTrEntity.partyB = event.params.partyB
    liquidTrEntity.timeStamp = event.block.timestamp
    liquidTrEntity.save()

    let partyAEntity = PartyA.load(event.params.partyA.toHexString())!
    partyAEntity.GlobalCounter = getGlobalCounterAndInc()
    partyAPartyBEntity.quoteUntilLiquid = []
    partyAEntity.quoteUntilLiquid = []
    partyAEntity.save()
    partyAPartyBEntity.save()

  }
}
