
import {SetSymbolTradingFeeHandler as CommonSetSymbolTradingFeeHandler} from "../../common/handlers/SetSymbolTradingFeeHandler"
import {SetSymbolTradingFee} from "../../generated/symmio/symmio"

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
    }
}
