import {
    AllocateForPartyB as AllocateForPartyBEvent,
    AllocatePartyA as AllocatePartyAEvent,
    AllocatePartyB as AllocatePartyBEvent,
    DeallocateForPartyB as DeallocateForPartyBEvent,
    DeallocatePartyA as DeallocatePartyAEvent,
    LiquidatePartyA as LiquidatePartyAEvent,
    LiquidatePartyB as LiquidatePartyBEvent,
} from "../generated/symmio/symmio"
import {ResultPartyA, ResultPartyB,} from "../generated/schema"

export function handleAllocatePartyA(
    event: AllocatePartyAEvent
): void {
    let allocateEntity = ResultPartyA.load(event.params.user.toHex())
    if (allocateEntity) {
        allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
        allocateEntity.timeStamp = event.block.timestamp
        allocateEntity.trHash = event.transaction.hash
        allocateEntity.blockNumber = event.block.number
        allocateEntity.save()
    } else {
        let allocateEntity = new ResultPartyA(event.params.user.toHex())
        allocateEntity.amount = event.params.amount
        allocateEntity.partyA = event.params.user
        allocateEntity.timeStamp = event.block.timestamp
        allocateEntity.trHash = event.transaction.hash
        allocateEntity.blockNumber = event.block.number
        allocateEntity.save()

    }
}

export function handleDeallocatePartyA(
    event: DeallocatePartyAEvent
): void {
    let allocateEntity = ResultPartyA.load(event.params.user.toHex())
    if (allocateEntity) {
        allocateEntity.amount = allocateEntity.amount.minus(event.params.amount)
        allocateEntity.timeStamp = event.block.timestamp
        allocateEntity.trHash = event.transaction.hash
        allocateEntity.blockNumber = event.block.number
        allocateEntity.save()
    } else {
        let allocateEntity = new ResultPartyA(event.params.user.toHex())
        allocateEntity.partyA = event.params.user
        allocateEntity.amount = event.params.amount
        allocateEntity.timeStamp = event.block.timestamp
        allocateEntity.trHash = event.transaction.hash
        allocateEntity.blockNumber = event.block.number
        allocateEntity.save()
    }
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
        allocateEntity.save()
    } else {
        let allocateEntity = new ResultPartyB(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
        allocateEntity.amount = event.params.amount
        allocateEntity.partyA = event.params.partyA
        allocateEntity.partyB = event.params.partyB
        allocateEntity.timeStamp = event.block.timestamp
        allocateEntity.trHash = event.transaction.hash
        allocateEntity.blockNumber = event.block.number
        allocateEntity.save()
    }
}


export function handleAllocateForPartyB(
    event: AllocateForPartyBEvent
): void {
    let allocateEntity = ResultPartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
    if (allocateEntity) {
        allocateEntity.amount = allocateEntity.amount.plus(event.params.amount)
        allocateEntity.timeStamp = event.block.timestamp
        allocateEntity.trHash = event.transaction.hash
        allocateEntity.blockNumber = event.block.number
        allocateEntity.save()
    } else {
        let allocateEntity = new ResultPartyB(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
        allocateEntity.amount = event.params.amount
        allocateEntity.partyA = event.params.partyA
        allocateEntity.partyB = event.params.partyB
        allocateEntity.timeStamp = event.block.timestamp
        allocateEntity.trHash = event.transaction.hash
        allocateEntity.blockNumber = event.block.number
        allocateEntity.save()
    }
}

export function handleDeallocateForPartyB(
    event: DeallocateForPartyBEvent
): void {
    let allocateEntity = ResultPartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
    if (allocateEntity) {
        allocateEntity.amount = allocateEntity.amount.minus(event.params.amount)
        allocateEntity.timeStamp = event.block.timestamp
        allocateEntity.trHash = event.transaction.hash
        allocateEntity.blockNumber = event.block.number
        allocateEntity.save()
    } else {

    }
}


export function handleLiquidatePartyA(
    event: LiquidatePartyAEvent
): void {
    let entity = ResultPartyA.load(event.params.partyA.toHex())
    if (entity) {
        entity.liquidatePartyATimeStamp = event.block.timestamp
        entity.trHash = event.transaction.hash
        entity.save()
    }

}

export function handleLiquidatePartyB(event: LiquidatePartyBEvent): void {
    let entity = ResultPartyB.load(event.params.partyA.toHex() + '-' + event.params.partyB.toHex())
    if (entity) {
        entity.liquidatePartyBTimeStamp = event.block.timestamp
        entity.trHash = event.transaction.hash
        entity.save()
    }
}
