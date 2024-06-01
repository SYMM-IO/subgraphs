
import { SetSymbolTradingFeeHandler as CommonSetSymbolTradingFeeHandler } from "../../common/handlers/SetSymbolTradingFeeHandler"
import { SetSymbolTradingFee } from "../../generated/symmio/symmio"
import { Symbol } from "../../generated/schema"

export class SetSymbolTradingFeeHandler extends CommonSetSymbolTradingFeeHandler {

	constructor(event: SetSymbolTradingFee) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		let event = super.getEvent()
		let symbol = Symbol.load(event.params.symbolId.toString())!
		symbol.tradingFee = event.params.tradingFee
		symbol.updateTimestamp = event.block.timestamp
		symbol.save()
	}
}
