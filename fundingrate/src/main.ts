import {BigInt} from '@graphprotocol/graph-ts'

import {
    ChargeFundingRate as ChargeFundingRateEvent,
    EmergencyClosePosition as EmergencyClosePositionEvent,
    FillCloseRequest as FillCloseRequestEvent,
    ForceClosePosition as ForceClosePositionEvent,
    OpenPosition as OpenPositionEvent,
    SendQuote as SendQuoteEvent,
} from "../generated/symmio/symmio"
import {GlobalFee, ResultEntity} from "../generated/schema"


const FACTOR: BigInt = BigInt.fromString(`1000000000000000000`);

export function handleChargeFundingRate(event: ChargeFundingRateEvent): void {
    for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
        let qoutId = event.params.quoteIds[i]
        const rate = event.params.rates[i]
        let entity = ResultEntity.load(qoutId.toString())!
        const openQuantityUntilNow = entity.quantity!.minus(entity.closedAmount!)
        let newPrice: BigInt;
        if (entity.positionType === 0) { //Long
            newPrice = entity.openedPrice!.plus(entity.openedPrice!.times(rate).div(FACTOR))
        } else {
            newPrice = entity.openedPrice!.minus(entity.openedPrice!.times(rate).div(FACTOR))
        }
        let fee: BigInt;
        fee = entity.openedPrice!.times(rate).times(openQuantityUntilNow).div(FACTOR).div(FACTOR)
        entity.fee = fee.plus(entity.fee!)
        entity.openedPrice = newPrice

        entity.save()

        let globalEntity = GlobalFee.load("GlobalEntity")
        if (!globalEntity) {
            globalEntity = new GlobalFee("GlobalEntity")
            globalEntity.globalFee = BigInt.fromI32(0)
        }
        globalEntity.globalFee = globalEntity.globalFee.plus(fee)
        globalEntity.latestTimeStamp = event.block.timestamp
        globalEntity.save()
    }
}



export function handleForceClosePosition(event: ForceClosePositionEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.fillAmount = event.params.filledAmount
    entity.closedPrice = event.params.closedPrice
    entity.quoteStatus = event.params.quoteStatus
    entity.closedAmount = entity.closedAmount!.plus(event.params.filledAmount)
    entity.timeStamp = event.block.timestamp
    entity.save()
}


export function handleFillCloseRequest(event: FillCloseRequestEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.fillAmount = event.params.filledAmount
    entity.closedPrice = event.params.closedPrice
    entity.quoteStatus = event.params.quoteStatus
    entity.closedAmount = entity.closedAmount!.plus(event.params.filledAmount)
    entity.timeStamp = event.block.timestamp
    entity.save()
}
export function handleSendQuote(event: SendQuoteEvent): void {
    let entity = new ResultEntity(event.params.quoteId.toString())
    entity.quoteId = event.params.quoteId
    entity.partyA = event.params.partyA
    entity.symbolId = event.params.symbolId
    entity.positionType = event.params.positionType
    entity.requestedOpenPrice = event.params.price
    entity.quantity = event.params.quantity
    entity.partyAmm = event.params.partyAmm
    entity.partyBmm = event.params.partyBmm
    entity.maxFundingRate = event.params.tradingFee
    entity.quoteStatus = 0
    entity.marketPrice = event.params.marketPrice
    entity.closedAmount = BigInt.fromI32(0)
    entity.initialQuantity = event.params.quantity
    entity.fee = BigInt.fromI32(0)
    entity.timeStamp = event.block.timestamp
    entity.save()
}


export function handleEmergencyClosePosition(
    event: EmergencyClosePositionEvent
): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.fillAmount = event.params.filledAmount
    entity.closedPrice = event.params.closedPrice
    entity.quoteStatus = event.params.quoteStatus
    entity.closedAmount = entity.closedAmount!.plus(event.params.filledAmount)
    entity.timeStamp = event.block.timestamp
    entity.save()
}


export function handleOpenPosition(event: OpenPositionEvent): void {
    let entity = ResultEntity.load(event.params.quoteId.toString())!
    entity.quoteId = event.params.quoteId
    entity.fillAmount = event.params.filledAmount
    entity.openedPrice = event.params.openedPrice
    entity.quoteStatus = 4
    entity.timeStamp = event.block.timestamp
    entity.quantity = event.params.filledAmount
    entity.initialOpenedPrice = event.params.openedPrice
    entity.save()
}
