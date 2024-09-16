import {LiquidatePartyA as LiquidatePartyAEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class LiquidatePartyAHandler<T>  {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidatePartyAEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.liquidator = event.params.liquidator;
		entity.partyA = event.params.partyA;
		entity.allocatedBalance = event.params.allocatedBalance;
		entity.upnl = event.params.upnl;
		entity.totalUnrealizedLoss = event.params.totalUnrealizedLoss;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
