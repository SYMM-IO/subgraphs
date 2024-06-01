import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { GlobalCounter } from "../generated/schema"
import { symmio, symmio__getQuoteResultValue0Struct } from "../generated/symmio/symmio"


export const FACTOR: BigInt = BigInt.fromString(`1000000000000000000`)

export function getGlobalCounterAndInc(): BigInt {
    let entity = GlobalCounter.load("GLOBAL")
    if (!entity) {
        entity = new GlobalCounter("GLOBAL")
        entity.counter = BigInt.fromI32(0)
    } else {
        entity.counter = entity.counter.plus(BigInt.fromI32(1))
    }
    entity.save()
    return entity.counter
}

export function allocatedBalanceOfPartyA(partyA: Address, contractAddress: Address): BigInt | null {
    let symmioContract = symmio.bind(contractAddress)
    let callResult = symmioContract.try_allocatedBalanceOfPartyA(partyA)
    if (callResult.reverted) {
        log.error("error in symbol bind", [])
        return null
    } else {
        return callResult.value
    }
}

export function getQuote(quoteId: BigInt, contractAddress: Address): symmio__getQuoteResultValue0Struct {
    let symmioContract = symmio.bind(contractAddress)
    return symmioContract.getQuote(quoteId)
}

export function allocatedBalanceOfPartyB(partyB: Address, partyA: Address, contractAddress: Address): BigInt | null {
    let symmioContract = symmio.bind(contractAddress)
    let callResult = symmioContract.try_allocatedBalanceOfPartyB(partyB, partyA)
    if (callResult.reverted) {
        log.error("error in symbol bind", [])
        return null
    } else {
        return callResult.value
    }
}

export function symbolIdToSymbolName(symbolId: BigInt, contractAddress: Address): string {
    let symmioContract = symmio.bind(contractAddress)
    let callResult = symmioContract.try_symbolNameByQuoteId([symbolId])
    if (callResult.reverted) {
        log.error("error in symbol bind", [])
        return ""
    } else {
        return callResult.value[0]
    }
}