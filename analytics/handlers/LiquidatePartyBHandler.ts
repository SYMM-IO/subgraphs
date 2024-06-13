import { LiquidatePartyBHandler as CommonLiquidatePartyBHandler } from "../../common/handlers/LiquidatePartyBHandler"
import { LiquidatePartyB } from "../../generated/symmio/symmio"
import { getBalanceInfoOfPartyB } from "../contract_utils"
import { PartyBLiquidation } from "../../generated/schema"

export class LiquidatePartyBHandler extends CommonLiquidatePartyBHandler {

	constructor(event: LiquidatePartyB) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		const event = this.getEvent()
		const balanceInfoOfPartyB = getBalanceInfoOfPartyB(event.address, event.params.partyA, event.params.partyB)
		if (balanceInfoOfPartyB == null)
			return
		let model = new PartyBLiquidation(event.transaction.hash.toHexString() + event.transactionLogIndex.toString())

		model.partyA = event.params.partyA
		model.partyB = event.params.partyB
		model.liquidator = event.params.liquidator
		model.timestamp = event.block.timestamp
		model.transaction = event.transaction.hash

		model.liquidateAllocatedBalance = balanceInfoOfPartyB.value0
		model.liquidateCva = balanceInfoOfPartyB.value1
		model.liquidateLf = balanceInfoOfPartyB.value2
		model.liquidatePendingCva = balanceInfoOfPartyB.value5
		model.liquidatePendingLf = balanceInfoOfPartyB.value6

		model.save()
	}
}
