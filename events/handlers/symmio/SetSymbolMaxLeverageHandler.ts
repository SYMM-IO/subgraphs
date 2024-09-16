import {SetSymbolMaxLeverage as SetSymbolMaxLeverageEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolMaxLeverageHandler<T>  {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetSymbolMaxLeverageEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.symbolId = event.params.symbolId;
		entity.oldMaxLeverage = event.params.oldMaxLeverage;
		entity.maxLeverage = event.params.maxLeverage;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
