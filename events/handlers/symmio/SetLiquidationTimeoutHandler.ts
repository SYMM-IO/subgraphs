import {SetLiquidationTimeout as SetLiquidationTimeoutEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetLiquidationTimeoutHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetLiquidationTimeoutEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.oldLiquidationTimeout = event.params.oldLiquidationTimeout;
		entity.newLiquidationTimeout = event.params.newLiquidationTimeout;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
