import { WithdrawHandler as CommonWithdrawHandler } from "../../common/handlers/WithdrawHandler"
import { Withdraw } from "../../generated/symmio/symmio"

export class WithdrawHandler extends CommonWithdrawHandler {

	constructor(event: Withdraw) {
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
