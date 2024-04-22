import {
    AllocateForPartyB as AllocateForPartyBEvent,
    AllocatePartyA as AllocatePartyAEvent,
    AllocatePartyB as AllocatePartyBEvent,
    DeallocateForPartyB as DeallocateForPartyBEvent,
    DeallocatePartyA as DeallocatePartyAEvent,
    LiquidatePartyA as LiquidatePartyAEvent,
    LiquidatePartyB as LiquidatePartyBEvent,
    symmio as symmio
} from "../generated/symmio/symmio"
import { ResultPartyA, ResultPartyB, } from "../generated/schema"
import { getGlobalCounterAndInc } from "./helper"

export function handleAllocatePartyA(
    event: AllocatePartyAEvent
): void {
    let allocateEntity = ResultPartyA.load(event.params.user.toHex())
    if (allocateEntity) {

        allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
    } else {
        allocateEntity = new ResultPartyA(event.params.user.toHex())
        allocateEntity.partyA = event.params.user
        allocateEntity.amount = event.params.amount
    }
    allocateEntity.timeStamp = event.block.timestamp
    allocateEntity.trHash = event.transaction.hash
    allocateEntity.blockNumber = event.block.number
    allocateEntity.GlobalCounter = getGlobalCounterAndInc()
    allocateEntity.save()
}

export function handleDeallocatePartyA(
    event: DeallocatePartyAEvent
): void {
    let deAllocateEntity = ResultPartyA.load(event.params.user.toHex())
    if (deAllocateEntity) {
        deAllocateEntity.amount = deAllocateEntity.amount.minus(event.params.amount)
    } else {
        deAllocateEntity = new ResultPartyA(event.params.user.toHex())
        deAllocateEntity.partyA = event.params.user
        deAllocateEntity.amount = event.params.amount
    }
    deAllocateEntity.timeStamp = event.block.timestamp
    deAllocateEntity.trHash = event.transaction.hash
    deAllocateEntity.blockNumber = event.block.number
    deAllocateEntity.GlobalCounter = getGlobalCounterAndInc()
    deAllocateEntity.save()
}


export function handleAllocatePartyB(
    event: AllocatePartyBEvent
): void {

    let allocateEntity = ResultPartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
    if (allocateEntity) {
        allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
        allocateEntity.timeStamp = event.block.timestamp
        allocateEntity.trHash = event.transaction.hash
        allocateEntity.blockNumber = event.block.number
    } else {
        allocateEntity = new ResultPartyB(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
        allocateEntity.amount = event.params.amount
        allocateEntity.partyA = event.params.partyA
        allocateEntity.partyB = event.params.partyB
    }
    allocateEntity.timeStamp = event.block.timestamp
    allocateEntity.trHash = event.transaction.hash
    allocateEntity.blockNumber = event.block.number
    allocateEntity.GlobalCounter = getGlobalCounterAndInc()
    allocateEntity.save()
}


export function handleAllocateForPartyB(
    event: AllocateForPartyBEvent
): void {
    let allocateEntity = ResultPartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
    if (allocateEntity) {
        allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
    } else {
        allocateEntity = new ResultPartyB(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
        allocateEntity.amount = event.params.amount
        allocateEntity.partyA = event.params.partyA
        allocateEntity.partyB = event.params.partyB
    }
    allocateEntity.timeStamp = event.block.timestamp
    allocateEntity.trHash = event.transaction.hash
    allocateEntity.blockNumber = event.block.number
    allocateEntity.GlobalCounter = getGlobalCounterAndInc()
    allocateEntity.save()
}

export function handleDeallocateForPartyB(
    event: DeallocateForPartyBEvent
): void {
    let deAllocateEntity = ResultPartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())!

    deAllocateEntity.amount = deAllocateEntity.amount.minus(event.params.amount)
    deAllocateEntity.timeStamp = event.block.timestamp
    deAllocateEntity.trHash = event.transaction.hash
    deAllocateEntity.blockNumber = event.block.number
    deAllocateEntity.GlobalCounter = getGlobalCounterAndInc()
    deAllocateEntity.save()

}


export function handleLiquidatePartyA(
    event: LiquidatePartyAEvent
): void {
    let entity = ResultPartyA.load(event.params.partyA.toHex())!

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
    entity.GlobalCounter = getGlobalCounterAndInc()
    entity.save()

}

export function handleLiquidatePartyB(event: LiquidatePartyBEvent): void {
    let entity = ResultPartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())!

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
    entity.trHash = event.transaction.hash
    entity.GlobalCounter = getGlobalCounterAndInc()
    entity.save()

}


