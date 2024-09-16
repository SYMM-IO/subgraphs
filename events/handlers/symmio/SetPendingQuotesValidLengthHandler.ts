import {SetPendingQuotesValidLength as SetPendingQuotesValidLengthEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetPendingQuotesValidLengthHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetPendingQuotesValidLengthEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.oldPendingQuotesValidLength = event.params.oldPendingQuotesValidLength;
		entity.newPendingQuotesValidLength = event.params.newPendingQuotesValidLength;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
