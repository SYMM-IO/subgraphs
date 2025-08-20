import { ethereum } from "@graphprotocol/graph-ts"
import { MultiAccountVersion } from "../../../common/BaseHandler"
import { AddAccount } from "../../../../generated/schema";
import { getGlobalCounterAndInc } from "../../../common/utils";
import { getSource } from "../../../common/utils/get_source";

export class AddAccountHandler<T> {
	handle(_event: ethereum.Event, version: MultiAccountVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entity = new AddAccount(event.params.account.toHexString())
		entity.user = event.params.user
		entity.source = getSource<T>(event, version)
		entity.counterId = getGlobalCounterAndInc()
		entity.account = event.params.account
		entity.accountSource = event.address
		entity.blockNumber = event.block.number
		entity.blockTimestamp = event.block.timestamp
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
