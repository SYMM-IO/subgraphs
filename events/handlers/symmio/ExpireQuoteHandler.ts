import {ExpireQuote as ExpireQuoteEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class ExpireQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new ExpireQuoteEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.quoteStatus = event.params.quoteStatus;
		entity.quoteId = event.params.quoteId;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
