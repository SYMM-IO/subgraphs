import {LiquidatePartyB as LiquidatePartyBEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";
import {getGlobalCounterAndInc} from "../../../common/utils";

export class LiquidatePartyBHandler<T>{
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidatePartyBEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.globalId = getGlobalCounterAndInc()
		entity.liquidator = event.params.liquidator;
		entity.partyB = event.params.partyB;
		entity.partyA = event.params.partyA;
		entity.partyBAllocatedBalance = event.params.partyBAllocatedBalance;
		entity.upnl = event.params.upnl;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
