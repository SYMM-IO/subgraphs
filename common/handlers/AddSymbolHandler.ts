import { BaseHandler } from "./BaseHandler"
import { AddSymbol } from "../../generated/symmio/symmio"
import { Symbol } from "../../generated/schema"

export class AddSymbolHandler extends BaseHandler {
	protected event: AddSymbol

	constructor(event: AddSymbol) {
		super(event)
		this.event = event
	}

	protected getEvent(): AddSymbol {
		return this.event
	}

	handle(): void {
		const globalCounter = super.handleGlobalCounter()
		let event = this.getEvent()
		let symbol = new Symbol(event.params.id.toString())
		symbol.globalCounter = globalCounter
		symbol.name = event.params.name
		symbol.tradingFee = event.params.tradingFee
		symbol.timestamp = event.block.timestamp
		symbol.updateTimestamp = event.block.timestamp
		symbol.blockNumber = event.block.number
		symbol.save()
	}

	handleQuote(): void {}
}
