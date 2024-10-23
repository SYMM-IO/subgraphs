import {RequestToCancelCloseRequest as RequestToCancelCloseRequestEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class RequestToCancelCloseRequestHandler<T>  {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new RequestToCancelCloseRequestEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.partyA = event.params.partyA;
		entity.partyB = event.params.partyB;
		entity.quoteId = event.params.quoteId;
		entity.quoteStatus = event.params.quoteStatus;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
