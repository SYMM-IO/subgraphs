import {BaseHandler, Version} from "../../BaseHandler"
import {Symbol} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";

export class AddSymbolHandler<T> extends BaseHandler {
	handleSymbol(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()
		let symbol = new Symbol(event.params.id.toString())
		symbol.globalCounter = globalCounter
		symbol.name = event.params.name
		symbol.tradingFee = event.params.tradingFee
		symbol.timestamp = event.block.timestamp
		symbol.updateTimestamp = event.block.timestamp
		symbol.blockNumber = event.block.number
		symbol.save()
	}
}
