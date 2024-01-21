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
    entity.requestedOpenPrice = resultArr[7].toBigInt()
    entity.marketPrice = resultArr[8].toBigInt()
    entity.quantity = resultArr[9].toBigInt()
    const initialLockedValues = resultArr[11].toTuple()
    entity.cva = initialLockedValues[0].toBigInt()
    entity.lf = initialLockedValues[1].toBigInt()
    entity.partyAmm = initialLockedValues[2].toBigInt()
    entity.partyBmm = initialLockedValues[3].toBigInt()
    entity.tradingFee = resultArr[13].toBigInt()
    entity.partyA = resultArr[14].toAddress()
    entity.quoteStatus = resultArr[16].toI32()
    entity.timeStamp = resultArr[21].toBigInt()
    entity.deadline = resultArr[24].toBigInt()
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

export function getQuote(quoteId: BigInt, contractAddress: Address): symmio__getQuoteResultValue0Struct {
    let symmioContract = symmio.bind(contractAddress)
    return symmioContract.getQuote(quoteId)
}