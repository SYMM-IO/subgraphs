import { Address, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import { symmio, symmio__getQuoteResultValue0Struct } from "../generated/symmio/symmio"
import { InitialQuote } from "../generated/schema"

export function initialHelper(resultArr: ethereum.Tuple): InitialQuote {
    let entity = new InitialQuote(resultArr[0].toBigInt().toString())
    entity.quoteId = resultArr[0].toBigInt()
    let tempArr = [] as Bytes[]
    const tempList = resultArr[1].toAddressArray()
    for (let length = tempList.length, i = 0; i < length; i++) {
        tempArr.push(tempList[i])
    }
    entity.partyBsWhiteList = tempArr
    entity.symbolId = resultArr[2].toBigInt()
    entity.positionType = resultArr[3].toI32()
    entity.orderTypeOpen = resultArr[4].toI32()
    entity.price = resultArr[6].toBigInt()
    entity.marketPrice = resultArr[7].toBigInt()
    entity.quantity = resultArr[8].toBigInt()
    const initialLockedValues = resultArr[10].toTuple()
    entity.cva = initialLockedValues[0].toBigInt()
    entity.mm = initialLockedValues[1].toBigInt()
    entity.lf = initialLockedValues[2].toBigInt()
    entity.maxInterestRate = resultArr[12].toBigInt()
    entity.partyA = resultArr[13].toAddress()
    entity.quoteStatus = resultArr[15].toI32()
    entity.timeStamp = resultArr[20].toBigInt()
    entity.deadline = resultArr[22].toBigInt()
    return entity
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

export function getQuote(quoteId: BigInt, contractAddress: Address) : symmio__getQuoteResultValue0Struct{
    let symmioContract = symmio.bind(contractAddress)
    return symmioContract.getQuote(quoteId)
}