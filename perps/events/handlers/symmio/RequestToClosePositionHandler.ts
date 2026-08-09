import { RequestToClosePosition as RequestToClosePositionEntity } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { findAccountSourceForQuote } from "../../utils/account_utils"

export class RequestToClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new RequestToClosePositionEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.partyA = event.params.partyA
		entity.partyB = event.params.partyB
		entity.quoteId = event.params.quoteId
		entity.accountSource = findAccountSourceForQuote(event.params.quoteId.toString() + "-" + event.address.toHexString())
		entity.closePrice = event.params.closePrice
		entity.quantityToClose = event.params.quantityToClose
		entity.orderType = event.params.orderType
		entity.deadline = event.params.deadline
		entity.quoteStatus = event.params.quoteStatus
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		entity.closeId = _event.parameters.length >= 9 ? _event.parameters[8].value.toBigInt() : BigInt.zero()

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
