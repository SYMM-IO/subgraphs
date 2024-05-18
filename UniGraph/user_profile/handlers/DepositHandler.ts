import { DepositHandler as CommonDepositHandler } from "../../common/handlers/DepositHandler"
import { Deposit } from "../../generated/symmio/symmio"

export class DepositHandler extends CommonDepositHandler {

	constructor(event: Deposit) {
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
