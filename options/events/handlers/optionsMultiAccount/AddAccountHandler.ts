// biome-ignore-all lint/style/useImportType: AssemblyScript does not support type-only imports.
import { ethereum } from "@graphprotocol/graph-ts"
import { MultiAccountVersion } from "../../../common/BaseHandler"
import { AddAccount } from "../../../../generated/schema"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class AddAccountHandler<T> {
	handle(_event: ethereum.Event, version: MultiAccountVersion): void {
		// @ts-expect-error
		const event = changetype<T>(_event)
		const entity = new AddAccount(event.params.account.toString())
		entity.user = event.params.user
		entity.counterId = getGlobalCounterAndInc()
		entity.account = event.params.account
		entity.name = event.params.name
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
