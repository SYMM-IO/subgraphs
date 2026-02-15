import { Deposit as DepositEntity } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class DepositHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new DepositEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.sender = event.params.sender
		entity.user = event.params.user
		entity.amount = event.params.amount

		// New variant (0.8.5) has isVirtual as 4th param
		if (_event.parameters.length >= 4) {
			entity.isVirtual = _event.parameters[3].value.toBoolean()
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		if (
			entity.transactionHash.toHexString() == "0xd87280448339c9bec39f98ea17e7371f13562b8b446863db7ee8f4ce53261c71" &&
			entity.blockNumber == BigInt.fromI32(35228647) &&
			entity.source.toHexString() == "0xc6a7cc26fd84ae573b705423b7d1831139793025"
		)
			entity.amount = event.params.amount.div(BigInt.fromString("1000000000000"))
		entity.save()
	}
}
