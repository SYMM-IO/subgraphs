import { SetSymbolsPricesHandler as CommonSetSymbolsPricesHandler } from "../../common/handlers/SetSymbolsPricesHandler"
import { SetSymbolsPrices } from "../../generated/symmio/symmio"

export class SetSymbolsPricesHandler extends CommonSetSymbolsPricesHandler {

	constructor(event: SetSymbolsPrices) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
	}
}
