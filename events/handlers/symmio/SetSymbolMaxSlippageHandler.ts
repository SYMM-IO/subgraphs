import {SetSymbolMaxSlippage as SetSymbolMaxSlippageEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolMaxSlippageHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetSymbolMaxSlippageEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.symbolId = event.params.symbolId;
		entity.oldMaxSlippage = event.params.oldMaxSlippage;
		entity.maxSlippage = event.params.maxSlippage;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
