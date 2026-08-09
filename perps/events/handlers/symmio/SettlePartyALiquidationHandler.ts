import { SettlePartyALiquidation as SettlePartyALiquidationEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SettlePartyALiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SettlePartyALiquidationEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.partyA = event.params.partyA
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		if (event.params.partyBs) {
			let partyBs: Bytes[] = []
			for (let i = 0, len = event.params.partyBs.length; i < len; i++) {
				partyBs.push(event.params.partyBs[i])
			}
			entity.partyBs = partyBs
		}

		entity.amounts = []
		entity.allocationKeys = []
		entity.cvaAmounts = []
		entity.liquidationId = Bytes.empty()
		if (_event.parameters.length >= 6) {
			let allocationKeys = _event.parameters[2].value.toAddressArray()
			let normalizedAllocationKeys: Bytes[] = []
			for (let i = 0; i < allocationKeys.length; i++) normalizedAllocationKeys.push(allocationKeys[i])
			entity.allocationKeys = normalizedAllocationKeys
			entity.amounts = _event.parameters[3].value.toBigIntArray()
			entity.cvaAmounts = _event.parameters[4].value.toBigIntArray()
			entity.liquidationId = _event.parameters[5].value.toBytes()
		} else if (_event.parameters.length >= 3) {
			entity.amounts = _event.parameters[2].value.toBigIntArray()
			if (_event.parameters.length >= 4) entity.liquidationId = _event.parameters[3].value.toBytes()
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
