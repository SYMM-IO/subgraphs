import {ethereum} from '@graphprotocol/graph-ts'
import {Quote} from "../../generated/schema"


export function setEventTimestampAndTransactionHashAndAction(quote: Quote, eventName: string, _event: ethereum.Event): void {
	quote.setBigInt("timestamp" + eventName, _event.block.timestamp)
	quote.setBytes("txHash" + eventName, _event.transaction.hash)
	quote.action = eventName
	quote.timestamp = _event.block.timestamp
	quote.blockNumber = _event.block.number
	quote.save()
}

