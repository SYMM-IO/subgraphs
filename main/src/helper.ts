import { Address, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import { symmio, symmio__getQuoteResultValue0Struct } from "../generated/symmio/symmio"
import { InitialQuote, GlobalCounter, PartyA, ResultEntity, PartyApartyB } from "../generated/schema"

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

export function getQuote(quoteId: BigInt, contractAddress: Address): symmio__getQuoteResultValue0Struct | null {
    let symmioContract = symmio.bind(contractAddress)
    let callResult = symmioContract.try_getQuote(quoteId)
    if (callResult.reverted) {
        log.error("error in get quote calling", [])
        return null
    }
    return callResult.value
}


export function removeQuoteFromPendingList(quoteId: BigInt): void {
    let quote = ResultEntity.load(quoteId.toString())
    if (quote) {

        let partyAEntity = PartyA.load(quote.partyA.toHexString())
        if (partyAEntity) {
            partyAEntity.GlobalCounter = getGlobalCounterAndInc()
            let temp = partyAEntity.quoteUntilLiquid!.slice(0)
            const indexA = temp.indexOf(quoteId)
            temp.splice(indexA, 1)
            partyAEntity.quoteUntilLiquid = temp.slice(0)
            partyAEntity.save()
        }
        let partyB = quote.partyB
        if (partyB) {
            let partyAPartyBEntity = PartyApartyB.load(quote.partyA.toHexString() + '-' + partyB.toHexString())
            if (partyAPartyBEntity) {
                partyAPartyBEntity.GlobalCounter = getGlobalCounterAndInc()
                let temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
                const indexB = temp.indexOf(quoteId)
                temp.splice(indexB, 1)
                partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
                partyAPartyBEntity.save()

            }
        }
    }
}