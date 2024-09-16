import {SetSymbolsPrices as SetSymbolsPricesEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolsPricesHandler<T>  {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetSymbolsPricesEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.liquidator = event.params.liquidator;
		entity.partyA = event.params.partyA;
		entity.symbolIds = event.params.symbolIds;
		entity.prices = event.params.prices;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
