import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {PartyA, PartyBPartyA, Quote} from "../../../generated/schema"
import {getGlobalCounterAndInc} from "../utils"

export function removeQuoteFromPendingList(quoteId: BigInt): void {
	let quote = Quote.load(quoteId.toString())
	if (quote) {

		let partyAEntity = PartyA.load(quote.partyA.toHexString())
		if (partyAEntity) {
			partyAEntity.globalCounter = getGlobalCounterAndInc()
			let qul = partyAEntity.quoteUntilLiquid
			if (qul) {
				let temp = qul.slice(0)
				const indexA = temp.indexOf(quoteId)
				if (indexA >= 0) temp.splice(indexA, 1)
				partyAEntity.quoteUntilLiquid = temp.slice(0)
			}
			partyAEntity.save()
		}
		let partyB = quote.partyB
		if (partyB) {
			let partyAPartyBEntity = PartyBPartyA.load(quote.partyA.toHexString() + '-' + partyB.toHexString())
			if (partyAPartyBEntity) {
				partyAPartyBEntity.globalCounter = getGlobalCounterAndInc()
				let qul = partyAPartyBEntity.quoteUntilLiquid
				if (qul) {
					let temp = qul.slice(0)
					const indexB = temp.indexOf(quoteId)
					if (indexB >= 0) temp.splice(indexB, 1)
					partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
				}
				partyAPartyBEntity.save()
			}
		}
	}
}

export function setEventTimestampAndTransactionHashAndAction(quote: Quote, eventName: string, _event: ethereum.Event): void {
	quote.action = eventName
	quote.timestamp = _event.block.timestamp
	quote.blockNumber = _event.block.number
	quote.save()
}