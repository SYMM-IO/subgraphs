import { SetAffiliateFeeForUser as SetAffiliateFeeForUserEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SetAffiliateFeeForUserHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetAffiliateFeeForUserEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.affiliate = event.params.affiliate
		entity.user = event.params.user
		entity.symbolId = event.params.symbolId
		entity.oldOpenFee = event.params.oldOpenFee
		entity.newOpenFee = event.params.newOpenFee
		entity.oldCloseFee = event.params.oldCloseFee
		entity.newCloseFee = event.params.newCloseFee

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
