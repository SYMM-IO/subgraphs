import { ForceClosePositionHandler as CommonForceClosePositionHandler } from "../../common/handlers/ForceClosePositionHandler"
import { ForceClosePosition } from "../../generated/symmio/symmio"

export class ForceClosePositionHandler extends CommonForceClosePositionHandler {

	constructor(event: ForceClosePosition) {
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
