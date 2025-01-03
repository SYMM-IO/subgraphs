import { SettlePartyALiquidation as SettlePartyALiquidationEntity } from "../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { SettlePartyALiquidation as SettlePartyALiquidation_8_4 } from "../../../generated/symmio_0_8_4/symmio_0_8_4"
import { SettlePartyALiquidation as SettlePartyALiquidation_8_3 } from "../../../generated/symmio_0_8_3/symmio_0_8_3"

export class SettlePartyALiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SettlePartyALiquidationEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.partyA = event.params.partyA
		if (event.params.partyBs) {
			let partyBs: Bytes[] = []
			for (let i = 0, len = event.params.partyBs.length; i < len; i++) {
				partyBs.push(event.params.partyBs[i])
			}
			entity.partyBs = partyBs
		}
		entity.amounts = event.params.amounts

		switch (version) {
			case Version.v_0_8_4: {
				// @ts-ignore
				const e = changetype<SettlePartyALiquidation_8_4>(_event)
				entity.liquidationId = e.params.liquidationId
				break
			}
			case Version.v_0_8_3: {
				// @ts-ignore
				const e = changetype<SettlePartyALiquidation_8_3>(_event)
				entity.liquidationId = e.params.liquidationId
				break
			}
			default: {
				entity.liquidationId = Bytes.empty()
				break
			}
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
