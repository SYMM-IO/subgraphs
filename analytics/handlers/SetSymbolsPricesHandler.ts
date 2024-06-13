import { SetSymbolsPricesHandler as CommonSetSymbolsPricesHandler } from "../../common/handlers/SetSymbolsPricesHandler"
import { SetSymbolsPrices } from "../../generated/symmio/symmio"
import { getBalanceInfoOfPartyA, getLiquidatedStateOfPartyA } from "../contract_utils"
import { PartyALiquidation } from "../../generated/schema"

export class SetSymbolsPricesHandler extends CommonSetSymbolsPricesHandler {

	constructor(event: SetSymbolsPrices) {
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
		const liquidationDetail = getLiquidatedStateOfPartyA(event.address, event.params.partyA)
		const balanceInfoOfPartyA = getBalanceInfoOfPartyA(event.address, event.params.partyA)
		if (liquidationDetail == null || balanceInfoOfPartyA == null)
			return
		let model = new PartyALiquidation(event.transaction.hash.toHexString() + event.transactionLogIndex.toString())

		model.partyA = event.params.partyA
		model.liquidator = event.params.liquidator
		model.liquidationType = liquidationDetail.liquidationType
		model.timestamp = event.block.timestamp
		model.transaction = event.transaction.hash

		model.liquidateAllocatedBalance = balanceInfoOfPartyA.value0
		model.liquidateCva = balanceInfoOfPartyA.value1
		model.liquidateLf = balanceInfoOfPartyA.value2
		model.liquidatePendingCva = balanceInfoOfPartyA.value5
		model.liquidatePendingLf = balanceInfoOfPartyA.value6

		model.save()
	}
}
