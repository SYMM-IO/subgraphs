import {SendQuote as SendQuoteEntity} from "../../../generated/schema";
import {Bytes, ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SendQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SendQuoteEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.partyA = event.params.partyA;
		entity.quoteId = event.params.quoteId;
		if (event.params.partyBsWhiteList) {
			let partyBsWhiteList: Bytes[] = []
			for (let i = 0, len = event.params.partyBsWhiteList.length; i < len; i++) {
				partyBsWhiteList.push(event.params.partyBsWhiteList[i])
			}
			entity.partyBsWhiteList = partyBsWhiteList
		}
		entity.symbolId = event.params.symbolId;
		entity.positionType = event.params.positionType;
		entity.orderType = event.params.orderType;
		entity.price = event.params.price;
		entity.marketPrice = event.params.marketPrice;
		entity.quantity = event.params.quantity;
		entity.cva = event.params.cva;
		entity.lf = event.params.lf;
		entity.partyAmm = event.params.partyAmm;
		entity.partyBmm = event.params.partyBmm;
		entity.tradingFee = event.params.tradingFee;
		entity.deadline = event.params.deadline;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
