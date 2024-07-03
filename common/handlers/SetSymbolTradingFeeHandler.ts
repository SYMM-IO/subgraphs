import { BaseHandler } from "../BaseHandler"
import { SetSymbolTradingFee } from "../../generated/symmio/symmio"

export class SetSymbolTradingFeeHandler extends BaseHandler {
	protected event: SetSymbolTradingFee

	constructor(event: SetSymbolTradingFee) {
		super(event)
		this.event = event
	}

	protected getEvent(): SetSymbolTradingFee {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		// TODO
	}
}