import { FillCloseRequest as FillCloseRequestEntity } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { findAccountSourceForQuote } from "../../utils/account_utils"

export class FillCloseRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new FillCloseRequestEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.quoteId = event.params.quoteId
		entity.accountSource = findAccountSourceForQuote(event.params.quoteId.toString() + "-" + event.address.toHexString())
		entity.partyA = event.params.partyA
		entity.partyB = event.params.partyB
		entity.filledAmount = event.params.filledAmount
		entity.closedPrice = event.params.closedPrice
		entity.quoteStatus = event.params.quoteStatus
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		// closeId is the seventh parameter in every event variant that emits it.
		entity.closeId = _event.parameters.length >= 7 ? _event.parameters[6].value.toBigInt() : BigInt.zero()

		// The canonical overload adds lockedValues as the eighth parameter.
		if (_event.parameters.length >= 8) {
			const lockedValuesTuple = _event.parameters[7].value.toTuple()
			entity.lockedValuesCva = lockedValuesTuple[0].toBigInt()
			entity.lockedValuesLf = lockedValuesTuple[1].toBigInt()
			entity.lockedValuesPartyAmm = lockedValuesTuple[2].toBigInt()
			entity.lockedValuesPartyBmm = lockedValuesTuple[3].toBigInt()
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
