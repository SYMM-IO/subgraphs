import { BigInt, } from '@graphprotocol/graph-ts'
import { GlobalCounter } from "../generated/schema"

export function getGlobalCounterAndInc(): BigInt {
    let entity = GlobalCounter.load("GLOBAL")
    if (!entity) {
        entity = new GlobalCounter("GLOBAL")
        entity.GlobalCounter = BigInt.fromI32(0)
    } else {
        entity.GlobalCounter = entity.GlobalCounter.plus(BigInt.fromI32(1))
    }
    entity.save()
    return entity.GlobalCounter
}

