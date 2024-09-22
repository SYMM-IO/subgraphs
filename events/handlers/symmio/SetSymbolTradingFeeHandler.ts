import {SetSymbolTradingFee as SetSymbolTradingFeeEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolTradingFeeHandler<T>  {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetSymbolTradingFeeEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.symbolId = event.params.symbolId;
		entity.oldTradingFee = event.params.oldTradingFee;
		entity.tradingFee = event.params.tradingFee;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
