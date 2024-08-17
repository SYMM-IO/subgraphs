import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { EventsTimestamp, InitialQuote, Quote, TransactionsHash } from "../../generated/schema"

import { symmio_0_8_0__getQuoteResultValue0Struct, } from "../../generated/symmio_0_8_0/symmio_0_8_0"
import { symmio_0_8_2__getQuoteResultValue0Struct } from "../../generated/symmio_0_8_2/symmio_0_8_2";
import { symmio_0_8_3__getQuoteResultValue0Struct } from '../../generated/symmio_0_8_3/symmio_0_8_3';


export function initialQuoteBuilder_0_8_0(q: symmio_0_8_0__getQuoteResultValue0Struct): InitialQuote {
	let entity = new InitialQuote(q.id.toString())
	entity.quoteId = q.id
	let tempArr = [] as Bytes[]
	const tempList = q.partyBsWhiteList
	for (let length = tempList.length, i = 0; i < length; i++) {
		tempArr.push(tempList[i])
	}
	entity.partyBsWhiteList = tempArr
	entity.symbolId = q.symbolId
	entity.positionType = q.positionType
	entity.orderTypeOpen = q.orderType
	entity.requestedOpenPrice = q.requestedOpenPrice
	entity.marketPrice = q.marketPrice
	entity.quantity = q.quantity
	entity.cva = q.lockedValues.cva
	entity.lf = q.lockedValues.lf
	entity.partyAmm = q.lockedValues.mm
	entity.partyBmm = q.lockedValues.mm
	entity.tradingFee = BigInt.zero() //FIXME Adapt
	entity.partyA = q.partyA
	entity.quoteStatus = q.quoteStatus
	entity.timeStamp = q.createTimestamp
	entity.deadline = q.deadline
	return entity
}

export function initialQuoteBuilder_0_8_2(q: symmio_0_8_2__getQuoteResultValue0Struct): InitialQuote {
	let entity = new InitialQuote(q.id.toString())
	entity.quoteId = q.id
	let tempArr = [] as Bytes[]
	const tempList = q.partyBsWhiteList
	for (let length = tempList.length, i = 0; i < length; i++) {
		tempArr.push(tempList[i])
	}
	entity.partyBsWhiteList = tempArr
	entity.symbolId = q.symbolId
	entity.positionType = q.positionType
	entity.orderTypeOpen = q.orderType
	entity.requestedOpenPrice = q.requestedOpenPrice
	entity.marketPrice = q.marketPrice
	entity.quantity = q.quantity
	entity.cva = q.lockedValues.cva
	entity.lf = q.lockedValues.lf
	entity.partyAmm = q.lockedValues.partyAmm
	entity.partyBmm = q.lockedValues.partyBmm
	entity.tradingFee = q.tradingFee
	entity.partyA = q.partyA
	entity.quoteStatus = q.quoteStatus
	entity.timeStamp = q.createTimestamp
	entity.deadline = q.deadline
	return entity
}

export function initialQuoteBuilder_0_8_3(q: symmio_0_8_3__getQuoteResultValue0Struct): InitialQuote {
	let entity = new InitialQuote(q.id.toString())
	entity.quoteId = q.id
	let tempArr = [] as Bytes[]
	const tempList = q.partyBsWhiteList
	for (let length = tempList.length, i = 0; i < length; i++) {
		tempArr.push(tempList[i])
	}
	entity.partyBsWhiteList = tempArr
	entity.symbolId = q.symbolId
	entity.positionType = q.positionType
	entity.orderTypeOpen = q.orderType
	entity.requestedOpenPrice = q.requestedOpenPrice
	entity.marketPrice = q.marketPrice
	entity.quantity = q.quantity
	entity.cva = q.lockedValues.cva
	entity.lf = q.lockedValues.lf
	entity.partyAmm = q.lockedValues.partyAmm
	entity.partyBmm = q.lockedValues.partyBmm
	entity.tradingFee = q.tradingFee
	entity.partyA = q.partyA
	entity.quoteStatus = q.quoteStatus
	entity.timeStamp = q.createTimestamp
	entity.deadline = q.deadline
	return entity
}

export function setEventTimestampAndTransactionHashAndAction(id: string, eventName: string, _event: ethereum.Event,): void {
	let timestampEntity = EventsTimestamp.load(id)
	if (!timestampEntity) {
		timestampEntity = new EventsTimestamp(id)
	}
	timestampEntity.setBigInt(eventName, _event.block.timestamp)
	timestampEntity.save()

	let trHashEntity = TransactionsHash.load(id)
	if (!trHashEntity) {
		trHashEntity = new TransactionsHash(id)
	}
	trHashEntity.setBytes(eventName, _event.transaction.hash)
	trHashEntity.save()

	let quote = Quote.load(id)!
	quote.action = eventName
	quote.timeStamp = _event.block.timestamp
	quote.blockNumber = _event.block.number
	quote.save()
}

