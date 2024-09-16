import {SettlePartyALiquidation as SettlePartyALiquidationEntity} from "../../../generated/schema";
import {Bytes, ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SettlePartyALiquidationHandler<T>  {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SettlePartyALiquidationEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.partyA = event.params.partyA;
		if (event.params.partyBs) {
			let partyBs: Bytes[] = []
			for (let i = 0, len = event.params.partyBs.length; i < len; i++) {
				partyBs.push(event.params.partyBs[i])
			}
			entity.partyBs = partyBs
		}
		entity.amounts = event.params.amounts;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
