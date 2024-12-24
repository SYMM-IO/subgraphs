import {BaseHandler, Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Symbol} from "../../../generated/schema";

export class SetSymbolTradingFeeHandler<T> extends BaseHandler {
	handleSymbol(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let symbol = Symbol.load(event.params.symbolId.toString())!
		symbol.tradingFee = event.params.tradingFee
		symbol.updateTimestamp = event.block.timestamp
		symbol.save()
	}
}