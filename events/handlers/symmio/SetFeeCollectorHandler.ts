import {SetFeeCollector as SetFeeCollectorEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetFeeCollectorHandler<T>  {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetFeeCollectorEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.oldFeeCollector = event.params.oldFeeCollector;
		entity.newFeeCollector = event.params.newFeeCollector;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}