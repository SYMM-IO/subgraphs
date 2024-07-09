
import { LiquidatePartyBHandler as CommonLiquidatePartyBHandler } from "../../common/handlers/LiquidatePartyBHandler"
import { PartyB } from "../../generated/schema"
import { LiquidatePartyB, symmio } from "../../generated/symmio/symmio"

export class LiquidatePartyBHandler extends CommonLiquidatePartyBHandler {

  constructor(event: LiquidatePartyB) {
    super(event)
  }

  handle(): void {
    super.handle(_event, version)
    super.handleGlobalCounter()
    const event = super.getEvent()
    let entity = PartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())!

    const balanceInfoOfPartyB = symmio.bind(event.address).balanceInfoOfPartyB(event.params.partyB, event.params.partyA)

    entity.liquidatePartyBTimeStamp = event.block.timestamp
    entity.trHashLiquidate = event.transaction.hash
    entity.liquidateAllocatedBalance = balanceInfoOfPartyB.value0
    entity.liquidateCva = balanceInfoOfPartyB.value1
    entity.liquidateLf = balanceInfoOfPartyB.value2
    entity.liquidatePendingCva = balanceInfoOfPartyB.value5
    entity.liquidatePendingLf = balanceInfoOfPartyB.value6
    entity.partyBAllocatedBalance = event.params.partyBAllocatedBalance
    entity.upnl = event.params.upnl
    entity.timeStamp = event.block.timestamp
    entity.blockNumber = event.block.number
    const globalCounter = super.handleGlobalCounter()
    entity.GlobalCounter = globalCounter
    entity.save()
  }
}
