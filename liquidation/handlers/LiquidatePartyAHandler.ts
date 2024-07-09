
import { LiquidatePartyAHandler as CommonLiquidatePartyAHandler } from "../../common/handlers/LiquidatePartyAHandler"
import { PartyA } from "../../generated/schema"
import { LiquidatePartyA, symmio } from "../../generated/symmio/symmio"

export class LiquidatePartyAHandler extends CommonLiquidatePartyAHandler {

  constructor(event: LiquidatePartyA) {
    super(event)
  }

  handle(): void {
    super.handle(_event, version)
    super.handleGlobalCounter()
    const event = super.getEvent()
    let entity = PartyA.load(event.params.partyA.toHex())!
    const balanceInfoOfPartyA = symmio.bind(event.address).balanceInfoOfPartyA(event.params.partyA)
    entity.liquidatePartyATimeStamp = event.block.timestamp
    entity.trHashLiquidate = event.transaction.hash
    entity.liquidateAllocatedBalance = balanceInfoOfPartyA.value0
    entity.liquidateCva = balanceInfoOfPartyA.value1
    entity.liquidateLf = balanceInfoOfPartyA.value2
    entity.liquidatePendingCva = balanceInfoOfPartyA.value5
    entity.liquidatePendingLf = balanceInfoOfPartyA.value6
    entity.timeStamp = event.block.timestamp
    entity.blockNumber = event.block.number
    entity.trHash = event.transaction.hash
    entity.totalUnrealizedLoss = event.params.totalUnrealizedLoss
    entity.upnl = event.params.upnl
    entity.allocatedBalance = event.params.allocatedBalance
    const globalCounter = super.handleGlobalCounter()
    entity.GlobalCounter = globalCounter
    entity.save()
  }
}
