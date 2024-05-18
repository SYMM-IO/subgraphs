import { LiquidationDisputedHandler as CommonLiquidationDisputedHandler } from "../../common/handlers/LiquidationDisputedHandler"
import { LiquidationDisputed } from "../../generated/symmio/symmio"
import { PartyALiquidationDisputed } from "../../generated/schema"

export class LiquidationDisputedHandler extends CommonLiquidationDisputedHandler {

	constructor(event: LiquidationDisputed) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		const event = this.getEvent()
		let model = new PartyALiquidationDisputed(event.transaction.hash.toHexString() + event.transactionLogIndex.toString())
		model.partyA = event.params.partyA
		model.timestamp = event.block.timestamp
		model.transaction = event.transaction.hash
		model.save()
	}
}
