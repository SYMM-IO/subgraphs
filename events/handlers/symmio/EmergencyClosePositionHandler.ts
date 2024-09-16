import {EmergencyClosePosition as EmergencyClosePositionEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class EmergencyClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new EmergencyClosePositionEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.quoteId = event.params.quoteId;
		entity.partyA = event.params.partyA;
		entity.partyB = event.params.partyB;
		entity.filledAmount = event.params.filledAmount;
		entity.closedPrice = event.params.closedPrice;
		entity.quoteStatus = event.params.quoteStatus;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
