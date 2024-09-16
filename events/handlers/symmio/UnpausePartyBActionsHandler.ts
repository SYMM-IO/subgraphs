import {UnpausePartyBActions as UnpausePartyBActionsEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class UnpausePartyBActionsHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new UnpausePartyBActionsEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
