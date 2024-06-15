import { AddSymbolHandler as CommonAddSymbolHandler } from "../../common/handlers/AddSymbolHandler"
import { AddSymbol } from "../../generated/symmio/symmio"

export class AddSymbolHandler extends CommonAddSymbolHandler {
	constructor(event: AddSymbol) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
	}
}
