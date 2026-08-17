import { OpenPosition as OpenPositionEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { findAccountSourceForQuote } from "../../utils/account_utils"

export class OpenPositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new OpenPositionEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.quoteId = event.params.quoteId
		entity.accountSource = findAccountSourceForQuote(event.params.quoteId.toString() + "-" + event.address.toHexString())
		entity.partyA = event.params.partyA
		entity.partyB = event.params.partyB
		entity.filledAmount = event.params.filledAmount
		entity.openedPrice = event.params.openedPrice

		// New variant (0.8.5) has lockedValues tuple as 6th param. Legacy 0.8.0
		// also has six parameters, but its final value is the uint8 quote status.
		if (_event.parameters.length >= 6 && _event.parameters[5].value.kind == ethereum.ValueKind.TUPLE) {
			let lockedValuesTuple = _event.parameters[5].value.toTuple()
			entity.lockedValuesCva = lockedValuesTuple[0].toBigInt()
			entity.lockedValuesLf = lockedValuesTuple[1].toBigInt()
			entity.lockedValuesPartyAmm = lockedValuesTuple[2].toBigInt()
			entity.lockedValuesPartyBmm = lockedValuesTuple[3].toBigInt()
		} else if (_event.parameters.length >= 6) {
			entity.quoteStatus = _event.parameters[5].value.toI32()
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
