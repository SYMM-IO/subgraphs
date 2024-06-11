import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { EventsTimestamp, InitialQuote, Quote, TransactionsHash } from "../../generated/schema"




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

export function setEventTimestampAndTransactionHashAndAction(id: string, timestamp: BigInt, eventName: string, trHash: Bytes, blockNumber: BigInt): void {
	let timestampEntity = EventsTimestamp.load(id)
	if (!timestampEntity) {
		timestampEntity = new EventsTimestamp(id)
	}
	timestampEntity.setBigInt(eventName, timestamp)
	timestampEntity.save()

	let trHashEntity = TransactionsHash.load(id)
	if (!trHashEntity) {
		trHashEntity = new TransactionsHash(id)
	}
	trHashEntity.setBytes(eventName, trHash)
	trHashEntity.save()

	let quote = Quote.load(id)!
	quote.action = eventName
	quote.timeStamp = timestamp
	quote.blockNumber = blockNumber
	quote.save()
}

