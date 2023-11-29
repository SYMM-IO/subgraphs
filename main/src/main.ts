import { BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'

import {
    AcceptCancelCloseRequest as AcceptCancelCloseRequestEvent,
    AcceptCancelRequest as AcceptCancelRequestEvent,
    EmergencyClosePosition as EmergencyClosePositionEvent,
    ExpireQuote as ExpireQuoteEvent,
    FillCloseRequest as FillCloseRequestEvent,
    ForceCancelCloseRequest as ForceCancelCloseRequestEvent,
    ForceCancelQuote as ForceCancelQuoteEvent,
    ForceClosePosition as ForceClosePositionEvent,
    LiquidatePartyA as LiquidatePartyAEvent,
    LiquidatePartyB as LiquidatePartyBEvent,
    LiquidatePendingPositionsPartyA as LiquidatePendingPositionsPartyAEvent,
    LiquidatePositionsPartyA as LiquidatePositionsPartyAEvent,
    LiquidatePositionsPartyB as LiquidatePositionsPartyBEvent,
    LockQuote as LockQuoteEvent,
    OpenPosition as OpenPositionEvent,
    RequestToCancelCloseRequest as RequestToCancelCloseRequestEvent,
    RequestToCancelQuote as RequestToCancelQuoteEvent,
    RequestToClosePosition as RequestToClosePositionEvent,
    SendQuote as SendQuoteEvent,
    SetSymbolsPrices as SetSymbolsPricesEvent,
    symmio,
    UnlockQuote as UnlockQuoteEvent
} from "../generated/symmio/symmio"
import {
    DebugEntity,
    InitialQuote,
    LiquidTransaction,
    PartyA,
    PartyApartyB,
    PartyASymbolPrice,
    ResultEntity
} from "../generated/schema"
import { allocatedBalanceOfPartyA, allocatedBalanceOfPartyB, getQuote, initialHelper, symbolIdToSymbolName } from './helper'


// const FACTOR: BigInt = BigInt.fromI32(10).pow(18);


export function handleSetSymbolsPrices(event: SetSymbolsPricesEvent): void {
    const listOFSymbols = event.params.symbolIds.slice(0)
    const listOfPrices = event.params.prices.slice(0)
    for (let i = 0, lenList = listOFSymbols.length; i < lenList; i++) {
        let entity = PartyASymbolPrice.load(event.params.partyA.toHexString().concat('-').concat(listOFSymbols[i].toHex()))
        if (!entity) {
            entity = new PartyASymbolPrice(event.params.partyA.toHexString().concat('-').concat(listOFSymbols[i].toHex()))
        }
        entity.symbolId = listOFSymbols[i]
        entity.partyA = event.params.partyA
        entity.price = listOfPrices[i]
        entity.timeStamp = event.block.timestamp
        entity.trHash = event.transaction.hash
        entity.save()
    }
}

export function handleLiquidatePartyA(event: LiquidatePartyAEvent): void {
    let partyAEntity = PartyA.load(event.params.partyA.toHexString())
    if (partyAEntity) {
        const list = partyAEntity.quoteUntilLiquid!.slice(0)
        for (let i = 0, lenQ = list.length; i < lenQ; i++) {
            const quoteId = list[i]
            let pendingEntity = ResultEntity.load(quoteId.toString())!
            if (pendingEntity.quoteStatus <= 2 && pendingEntity.quoteStatus >= 0) {
                pendingEntity.quoteStatus = 8
            } else {
                pendingEntity.quoteStatus = 3
            }
            pendingEntity.save()
        }

        let liquidTrEntity = new LiquidTransaction(event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toHexString()))
        liquidTrEntity.mode = "Pending"
        const balance = allocatedBalanceOfPartyA(event.params.partyA, event.address)
        if (balance) {
            liquidTrEntity.balance = balance
        }
        liquidTrEntity.pendigQuoteLiquidateList = list
        liquidTrEntity.listLenght = list.length
        liquidTrEntity.partyA = event.params.partyA
        liquidTrEntity.timeStamp = event.block.timestamp
        liquidTrEntity.save()
        partyAEntity.save()
    }
}

export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyAEvent): void {
    let partyAEntity = PartyA.load(event.params.partyA.toHexString())
    if (partyAEntity) {
        const list = partyAEntity.quoteUntilLiquid!.slice(0)
        for (let i = 0, lenQ = list.length; i < lenQ; i++) {
            const quoteId = list[i]
            let pendingEntity = ResultEntity.load(quoteId.toString())!
            if (pendingEntity.quoteStatus <= 2 && pendingEntity.quoteStatus >= 0) {
                pendingEntity.quoteStatus = 8
                pendingEntity.save()
                if (pendingEntity.partyB) {
                    let partyAPartyBEntity = PartyApartyB.load(event.params.partyA.toHexString() + '-' + pendingEntity.partyB!.toHexString())!
                    partyAPartyBEntity.quoteUntilLiquid = []
                    partyAPartyBEntity.save()
                }
            } else {
                log.error(`error in liquidate positions party A\nQuoteId: ${quoteId}\nQuote status: ${pendingEntity.quoteStatus}`, [])
            }
        }

        let liquidTrEntity = new LiquidTransaction(event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toHexString()))
        liquidTrEntity.mode = "Pending"
        const balance = allocatedBalanceOfPartyA(event.params.partyA, event.address)
        if (balance) {
            liquidTrEntity.balance = balance
        }
        liquidTrEntity.pendigQuoteLiquidateList = list
        liquidTrEntity.listLenght = list.length
        liquidTrEntity.partyA = event.params.partyA
        liquidTrEntity.timeStamp = event.block.timestamp
        liquidTrEntity.save()
        partyAEntity.quoteUntilLiquid = []
        partyAEntity.save()
    }
}


export function handleLiquidatePartyB(event: LiquidatePartyBEvent): void {
    let partyAPartyBEntity = PartyApartyB.load(event.params.partyA.toHexString() + '-' + event.params.partyB.toHexString())!
    const list = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
    if (partyAPartyBEntity) {
        for (let i = 0, lenQ = list.length; i < lenQ; i++) {
            const quoteId = list[i]
            let entity = ResultEntity.load(quoteId.toString())!
            if (entity.quoteStatus <= 2 && entity.quoteStatus >= 0) {
                entity.quoteStatus = 8
                entity.save()
            } else {
                log.error(`error in liquidate positions party B\nQuoteId: ${quoteId}\nQuote status: ${entity.quoteStatus}`, [])
            }
        }


        let liquidTrEntity = new LiquidTransaction(event.transaction.hash.toHexString())
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
        partyAPartyBEntity.quoteUntilLiquid = []
        partyAEntity.quoteUntilLiquid = []
        partyAEntity.save()
        partyAPartyBEntity.save()

    }
}


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyBEvent): void {
    for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
        let qoutId = event.params.quoteIds[i]
        let entity = ResultEntity.load(qoutId.toString())!
        entity.timeStampLiquidatePositionsPartyBTimeStamp = event.block.timestamp
        entity.TrHashLiquidatePositionsPartyB = event.transaction.hash
        entity.timeStamp = event.block.timestamp
        entity.quoteStatus = 8

        let symmioContract = symmio.bind(event.address)
        let callResult = symmioContract.try_getQuote(qoutId)
        if (callResult.reverted) {
            log.error('liquidate bind crashed!', [])
        } else {
            const Result = callResult.value as ethereum.Tuple
            const getclosedAmount = entity.quantity!
            let getAveragePrice = Result[16].toBigInt()
            let LiquidateAmount = getclosedAmount.minus(entity.closedAmount!)
            entity.liquidateAmount = LiquidateAmount
            if (getAveragePrice.gt(BigInt.fromI32(0))) {
                entity.liquidatePrice = ((getAveragePrice.times(getclosedAmount)).minus(entity.averageClosedPrice!.times(entity.closedAmount!))).div(LiquidateAmount)
            } else {
                log.debug(`get total fill amount: ${getclosedAmount} , past total fill amount: ${entity.closedAmount!.toString()}\nQuoteId: ${entity.quoteId}`, [])
            }
        }
        entity.save()
    }
}

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyAEvent): void {
    for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
        let qoutId = event.params.quoteIds[i]
        let entity = ResultEntity.load(qoutId.toString())!
        entity.timeStampLiquidatePositionsPartyATimeStamp = event.block.timestamp
        entity.TrHashLiquidatePositionsPartyA = event.transaction.hash
        entity.timeStamp = event.block.timestamp
        entity.quoteStatus = 8
        let LiquidateAmount = entity.quantity!.minus(entity.closedAmount!)
        entity.liquidateAmount = LiquidateAmount

        let symmioContract = symmio.bind(event.address)
        let callResult = symmioContract.try_getQuote(qoutId)
        let partyASymbolPriceEntity = PartyASymbolPrice.load(event.params.partyA.toHexString().concat('-').concat(entity.symbolId!.toHex()))
        if (partyASymbolPriceEntity) {
            entity.liquidatePrice = partyASymbolPriceEntity.price
        } else {
            log.debug(`Error in get entity liquidate price`, [])
        }
        entity.save()
    }

}

export function handleRequestToClosePosition(event: RequestToClosePositionEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.closePrice = event.params.closePrice
    entity.deadline = event.params.deadline
    entity.orderTypeClose = event.params.orderType
    entity.partyA = event.params.partyA
    entity.partyB = event.params.partyB
    entity.quantityToClose = event.params.quantityToClose
    entity.quoteId = event.params.quoteId
    entity.quoteStatus = event.params.quoteStatus
    entity.timestampsRequestToClosePositionTimeStamp = event.block.timestamp
    entity.TrHashRequestToClosePosition = event.transaction.hash
    entity.timeStamp = event.block.timestamp

    entity.save()
}

export function handleExpireQuote(event: ExpireQuoteEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    if (entity.quoteStatus === 2) {
        log.debug(`Quote id: ${entity.quoteId} , expire tr hash: ${event.transaction.hash}`, [])
    }
    entity.quoteId = event.params.quoteId
    entity.timeStamp = event.block.timestamp
    entity.timestampsExpireQuoteTimeStamp = event.block.timestamp
    entity.TrHashExpireQuote = event.transaction.hash


    if (entity.quoteStatus === 0) {
        let partyAEntity = PartyA.load(entity.partyA.toHexString())!
        let temp = partyAEntity.quoteUntilLiquid!.slice(0)
        const indexA = temp.indexOf(event.params.quoteId)
        const removedPa = temp.splice(indexA, 1)
        partyAEntity.quoteUntilLiquid = temp.slice(0)
        log.debug(`remove in expire quote party A = ${removedPa}\nnew list: ${temp.toString()} remove index: ${indexA}`, [])
        partyAEntity.save()
    } else if (entity.quoteStatus === 1) {
        let partyAPartyBEntity = PartyApartyB.load(entity.partyA.toHexString() + '-' + entity.partyB!.toHexString())!
        let temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
        const indexB = temp.indexOf(event.params.quoteId)
        const removedPb = temp.splice(indexB, 1)
        partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
        log.debug(`remove in expire quote party B = ${removedPb}\nnew list: ${temp.toString()} remove index: ${indexB}`, [])
    }

    entity.quoteStatus = event.params.quoteStatus
    entity.save()
}

export function handleForceCancelCloseRequest(
    event: ForceCancelCloseRequestEvent
): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.quoteId = event.params.quoteId
    entity.quoteStatus = event.params.quoteStatus
    entity.timeStamp = event.block.timestamp
    entity.timestampsForceCancelCloseRequestTimeStamp = event.block.timestamp
    entity.TrHashForceCancelCloseRequest = event.transaction.hash

    entity.save()
}

export function handleForceCancelQuote(event: ForceCancelQuoteEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.quoteId = event.params.quoteId
    entity.quoteStatus = event.params.quoteStatus
    entity.timeStamp = event.block.timestamp
    entity.timestampsForceCancelQuoteTimeStamp = event.block.timestamp
    entity.TrHashForceCancelQuote = event.transaction.hash
    entity.save()

}


export function handleForceClosePosition(event: ForceClosePositionEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.quoteId = event.params.quoteId
    entity.fillAmount = event.params.filledAmount
    entity.closedPrice = event.params.closedPrice
    entity.averageClosedPrice = (entity.closedAmount!.times(entity.averageClosedPrice!).plus(event.params.filledAmount.times(event.params.closedPrice))).div(entity.closedAmount!.plus(event.params.filledAmount))
    entity.closedAmount = entity.closedAmount!.plus(event.params.filledAmount)
    entity.quoteStatus = event.params.quoteStatus
    entity.timeStamp = event.block.timestamp
    entity.timestampsForceClosePositionTimeStamp = event.block.timestamp
    entity.TrHashForceClosePosition = event.transaction.hash
    entity.save()

}

export function handleRequestToCancelCloseRequest(
    event: RequestToCancelCloseRequestEvent
): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.quoteId = event.params.quoteId

    entity.partyA = event.params.partyA
    entity.partyB = event.params.partyB
    entity.quoteStatus = event.params.quoteStatus
    entity.timeStamp = event.block.timestamp
    entity.timestampsRequestToCancelCloseRequestTimeStamp = event.block.timestamp
    entity.TrHashRequestToCancelCloseRequest = event.transaction.hash
    entity.save()
}

export function handleRequestToCancelQuote(
    event: RequestToCancelQuoteEvent
): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.quoteId = event.params.quoteId
    entity.partyA = event.params.partyA
    entity.quoteStatus = event.params.quoteStatus
    entity.timeStamp = event.block.timestamp
    entity.timestampsRequestToCancelQuoteTimeStamp = event.block.timestamp
    entity.TrHashRequestToCancelQuote = event.transaction.hash
    entity.save()

    if (event.params.quoteStatus === 3) {
        let partyAEntity = PartyA.load(entity.partyA.toHexString())!
        let temp = partyAEntity.quoteUntilLiquid!.slice(0)
        const indexA = temp.indexOf(event.params.quoteId)
        temp.splice(indexA, 1)
        partyAEntity.quoteUntilLiquid = temp.slice(0)
        partyAEntity.save()
    }

}

export function handleSendQuote(event: SendQuoteEvent): void {
    let entity = new ResultEntity(event.params.quoteId.toString())

    entity.quoteId = event.params.quoteId
    entity.orderTypeOpen = event.params.orderType
    entity.partyA = event.params.partyA
    entity.symbolId = event.params.symbolId
    entity.positionType = event.params.positionType
    entity.price = event.params.price
    entity.quantity = event.params.quantity
    entity.cva = event.params.cva
    entity.mm = event.params.mm
    entity.lf = event.params.lf
    entity.maxInterestRate = event.params.maxInterestRate
    entity.deadline = event.params.deadline
    entity.quoteStatus = event.params.quoteStatus
    entity.marketPrice = event.params.marketPrice
    entity.averageClosedPrice = BigInt.fromI32(0)
    entity.closedAmount = BigInt.fromI32(0)


    let initialEntity = new InitialQuote(event.params.quoteId.toString())
    initialEntity.quoteId = event.params.quoteId
    initialEntity.orderTypeOpen = event.params.orderType
    initialEntity.partyA = event.params.partyA
    initialEntity.symbolId = event.params.symbolId
    initialEntity.positionType = event.params.positionType
    initialEntity.price = event.params.price
    initialEntity.quantity = event.params.quantity
    initialEntity.cva = event.params.cva
    initialEntity.mm = event.params.mm
    initialEntity.lf = event.params.lf
    initialEntity.maxInterestRate = event.params.maxInterestRate
    initialEntity.deadline = event.params.deadline
    initialEntity.quoteStatus = event.params.quoteStatus
    initialEntity.marketPrice = event.params.marketPrice

    let symmioContract = symmio.bind(event.address)
    let callResult = symmioContract.try_symbolNameByQuoteId([event.params.quoteId])
    if (callResult.reverted) {
        log.error("error in symbol bind", [])
    } else {
        entity.symbol = callResult.value[0]
        initialEntity.symbol = callResult.value[0]

    }


    if (event.params.partyBsWhiteList) {
        let partyBsWhiteList: Bytes[] = []
        for (let i = 0, len = event.params.partyBsWhiteList.length; i < len; i++) {
            partyBsWhiteList.push(event.params.partyBsWhiteList[i])
        }
        entity.partyBsWhiteList = partyBsWhiteList
        initialEntity.partyBsWhiteList = partyBsWhiteList

    }
    entity.timeStamp = event.block.timestamp
    initialEntity.timeStamp = event.block.timestamp
    entity.timestampsSendQuoteTimeStamp = event.block.timestamp
    entity.TrHashSendQuote = event.transaction.hash


    let partyAEntity = PartyA.load(event.params.partyA.toHexString())
    if (!partyAEntity) {
        partyAEntity = new PartyA(event.params.partyA.toHexString())
        partyAEntity.quoteUntilLiquid = [event.params.quoteId]
    } else {
        let temp = partyAEntity.quoteUntilLiquid!.slice(0)
        temp.push(event.params.quoteId)

        partyAEntity.quoteUntilLiquid = temp.slice(0)
    }
    initialEntity.save()
    entity.initialData = initialEntity.id
    entity.save()

    partyAEntity.save()

}


export function handleAcceptCancelCloseRequest(
    event: AcceptCancelCloseRequestEvent
): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!

    entity.quoteId = event.params.quoteId
    entity.quoteStatus = event.params.quoteStatus

    entity.save()
}

export function handleAcceptCancelRequest(
    event: AcceptCancelRequestEvent
): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())
    if (entity) {

        entity.quoteId = event.params.quoteId
        entity.quoteStatus = event.params.quoteStatus
        entity.timeStamp = event.block.timestamp
        entity.timestampsAcceptCancelCloseRequestTimeStamp = event.block.timestamp
        entity.TrHashAcceptCancelCloseRequest = event.transaction.hash
        entity.save()


        let partyAEntity = PartyA.load(entity.partyA.toHexString())!
        let temp = partyAEntity.quoteUntilLiquid!.slice(0)
        const indexA = temp.indexOf(event.params.quoteId)
        const removedPa = temp.splice(indexA, 1)
        partyAEntity.quoteUntilLiquid = temp.slice(0)
        log.debug(`remove in accept cancel request party A = ${removedPa}\nnew list: ${temp.toString()} remove index: ${indexA}`, [])
        partyAEntity.save()
        let partyAPartyBEntity = PartyApartyB.load(entity.partyA.toHexString() + '-' + entity.partyB!.toHexString())!
        temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
        const indexB = temp.indexOf(event.params.quoteId)
        const removedPb = temp.splice(indexB, 1)
        partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
        log.debug(`remove in accept cancel request party B = ${removedPb}\nnew list: ${temp.toString()} remove index: ${indexB}`, [])

        partyAPartyBEntity.save()


    } else {
        let newEntity = new ResultEntity(event.params.quoteId.toString())
        newEntity.quoteId = event.params.quoteId
        newEntity.quoteStatus = event.params.quoteStatus
        newEntity.timeStamp = event.block.timestamp
        newEntity.timestampsAcceptCancelCloseRequestTimeStamp = event.block.timestamp
        newEntity.TrHashAcceptCancelCloseRequest = event.transaction.hash
        let symmioContract = symmio.bind(event.address)
        let callResult = symmioContract.try_getQuote(event.params.quoteId)
        if (callResult.reverted) {
            log.error('accept cancel bind crashed!', [])
        } else {
            let Result = callResult.value as ethereum.Tuple
            let initialNewEntity = initialHelper(Result)
            if (initialNewEntity) {
                const debugEntity = new DebugEntity(event.transaction.hash.toString().concat(event.logIndex.toString()))
                debugEntity.trigger = initialNewEntity.cva
                debugEntity.type = "bind"
                debugEntity.timestamp = event.block.timestamp
                debugEntity.message = `qouteId: ${event.params.quoteId}`
                debugEntity.save()
                const symbol = symbolIdToSymbolName(initialNewEntity.symbolId, event.address)
                if (symbol) {
                    initialNewEntity.symbol = symbol
                }
            }
            initialNewEntity.save()
            newEntity.partyA = initialNewEntity.partyA
            newEntity.initialData = initialNewEntity.id
        }
        newEntity.save()
    }
}

export function handleEmergencyClosePosition(
    event: EmergencyClosePositionEvent
): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!

    entity.quoteId = event.params.quoteId
    entity.fillAmount = event.params.filledAmount
    entity.closedPrice = event.params.closedPrice
    entity.quoteStatus = event.params.quoteStatus
    entity.averageClosedPrice = (entity.closedAmount!.times(entity.averageClosedPrice!).plus(event.params.filledAmount.times(event.params.closedPrice))).div(entity.closedAmount!.plus(event.params.filledAmount))
    entity.closedAmount = entity.closedAmount!.plus(event.params.filledAmount)

    entity.timeStamp = event.block.timestamp
    entity.timestampsEmergencyClosePositionTimeStamp = event.block.timestamp
    entity.TrHashForceClosePosition = event.transaction.hash
    entity.save()
}


export function handleFillCloseRequest(event: FillCloseRequestEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!

    // let debug = new DebugEntity(event.transaction.hash.toHexString());
    // debug.type = event.params.quoteId.toString()
    // debug.timestamp = event.block.timestamp
    // debug.message = `fillClose:{quantity:${entity.quantity!.toString()}, closedAmount:${entity.closedAmount!.toString()}, oldCva:${entity.cva!.toString()}`

    // const openAmount = entity.quantity!.minus(entity.closedAmount!)
    // const coef = openAmount.minus(event.params.filledAmount).times(FACTOR).div(openAmount)
    // entity.cva = entity.cva!.times(coef).div(FACTOR)
    // entity.mm = entity.mm!.times(coef).div(FACTOR)
    // entity.lf = entity.lf!.times(coef).div(FACTOR)

    // debug.message = debug.message! + `,newCva:${entity.cva!.toString()}}`
    // debug.save()

    let q = getQuote(event.params.quoteId, event.address);
    entity.cva = q.lockedValues.cva
    entity.mm = q.lockedValues.mm
    entity.lf = q.lockedValues.lf

    entity.quoteId = event.params.quoteId
    entity.fillAmount = event.params.filledAmount
    entity.closedPrice = event.params.closedPrice
    entity.quoteStatus = event.params.quoteStatus
    entity.averageClosedPrice = (entity.closedAmount!.times(entity.averageClosedPrice!).plus(event.params.filledAmount.times(event.params.closedPrice))).div(entity.closedAmount!.plus(event.params.filledAmount))
    entity.closedAmount = entity.closedAmount!.plus(event.params.filledAmount)
    entity.timeStamp = event.block.timestamp
    entity.timestampsFillCloseRequestTimeStamp = event.block.timestamp
    entity.TrHashFillCloseRequest = event.transaction.hash
    entity.save()
}

export function handleLockQuote(event: LockQuoteEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())
    if (entity) {

        entity.quoteId = event.params.quoteId
        entity.partyB = event.params.partyB
        entity.quoteStatus = event.params.quoteStatus
        entity.timeStamp = event.block.timestamp
        entity.timestampsLockQuoteTimeStamp = event.block.timestamp
        entity.TrHashLockQuote = event.transaction.hash
        entity.save()
        let partyAPartyBEntity = PartyApartyB.load(entity.partyA.toHexString() + '-' + event.params.partyB.toHexString())
        if (!partyAPartyBEntity) {
            partyAPartyBEntity = new PartyApartyB(entity.partyA.toHexString() + '-' + event.params.partyB.toHexString())
            partyAPartyBEntity.quoteUntilLiquid = [event.params.quoteId]
        } else {
            let temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
            temp.push(event.params.quoteId)
            partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
        }
        partyAPartyBEntity.save()

    }

}

export function handleOpenPosition(event: OpenPositionEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.quoteId = event.params.quoteId
    entity.fillAmount = event.params.filledAmount
    entity.openedPrice = event.params.openedPrice
    entity.quoteStatus = event.params.quoteStatus
    entity.timeStamp = event.block.timestamp
    entity.timestampsOpenPositionTimeStamp = event.block.timestamp
    entity.TrHashOpenPosition = event.transaction.hash
    entity.quantity = event.params.filledAmount

    if (entity.orderTypeOpen === 0) {
        const initialEntity = InitialQuote.load(entity.initialData!)!
        // const priceCoef = event.params.openedPrice.times(FACTOR).div(initialEntity.price)
        // const quantityCoef = event.params.filledAmount.times(FACTOR).div(initialEntity.quantity)
        // const newCva = entity.cva!.times(priceCoef.times(quantityCoef)).div(FACTOR.times(FACTOR))
        // const newMM = entity.mm!.times(priceCoef.times(quantityCoef)).div(FACTOR.times(FACTOR))
        // const newLF = entity.lf!.times(priceCoef.times(quantityCoef)).div(FACTOR.times(FACTOR))

        // let debug = new DebugEntity(event.transaction.hash.toHexString());
        // debug.type = event.params.quoteId.toString()
        // debug.trigger = newCva
        // debug.timestamp = event.block.timestamp
        // debug.message = `openPosition:{openPrice:${event.params.openedPrice.toString()}, requestedPrice:${initialEntity.price.toString()}, fillAmount:${event.params.filledAmount.toString()}, quantity:${initialEntity.quantity.toString()},oldCva:${entity.cva!.toString()}, newCva:${newCva.toString()}}`
        // debug.save()

        let q = getQuote(event.params.quoteId, event.address);
        const newCva = q.lockedValues.cva
        const newMM = q.lockedValues.mm
        const newLF = q.lockedValues.lf

        entity.cva = newCva
        entity.mm = newMM
        entity.lf = newLF
        initialEntity.cva = newCva
        initialEntity.mm = newMM
        initialEntity.lf = newLF
        initialEntity.quantity = event.params.filledAmount
        initialEntity.save()
    }

    entity.save()

    let partyAEntity = PartyA.load(event.params.partyA.toHexString())!
    let temp = partyAEntity.quoteUntilLiquid!.slice(0)
    const indexA = temp.indexOf(event.params.quoteId)
    const removedPa = temp.splice(indexA, 1)
    partyAEntity.quoteUntilLiquid = temp.slice(0)
    log.debug(`remove in open positions party A = ${removedPa}\nnew list: ${temp.toString()} remove index: ${indexA}`, [])
    partyAEntity.save()
    let partyAPartyBEntity = PartyApartyB.load(event.params.partyA.toHexString() + '-' + event.params.partyB.toHexString())!
    temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
    const indexB = temp.indexOf(event.params.quoteId)
    const removedPb = temp.splice(indexB, 1)
    partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
    log.debug(`remove in open positions party B = ${removedPb}\nnew list: ${temp.toString()} remove index: ${indexB}`, [])

    partyAPartyBEntity.save()
}


export function handleUnlockQuote(event: UnlockQuoteEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!

    entity.quoteId = event.params.quoteId
    entity.partyB = null
    entity.quoteStatus = event.params.quoteStatus

    entity.timeStamp = event.block.timestamp
    entity.timestampsUnlockQuoteTimeStamp = event.block.timestamp
    entity.TrHashUnlockQuote = event.transaction.hash
    entity.save()

}