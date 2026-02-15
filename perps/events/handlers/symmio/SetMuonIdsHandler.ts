import { SetMuonIds as SetMuonIdsEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SetMuonIdsHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetMuonIdsEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.muonAppId = event.params.muonAppId

		// v0.8.5 only has muonAppId, older versions have gateway, x, parity
		if (version != Version.v_0_8_5) {
			entity.gateway = _event.parameters[1].value.toAddress()
			entity.x = _event.parameters[2].value.toBigInt()
			entity.parity = _event.parameters[3].value.toI32()
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
