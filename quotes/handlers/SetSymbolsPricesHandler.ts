import { SetSymbolsPricesHandler as CommoneSetSymbolsPricesHandler } from "../../common/handlers/SetSymbolsPricesHandler"
import { getGlobalCounterAndInc } from "../../common/utils"

import { PartyASymbolPrice } from "../../generated/schema"
import { SetSymbolsPrices } from "../../generated/symmio/symmio"

export class SetSymbolsPricesHandler extends CommoneSetSymbolsPricesHandler {

	constructor(event: SetSymbolsPrices) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()


		const listOFSymbols = this.event.params.symbolIds.slice(0)
		const listOfPrices = this.event.params.prices.slice(0)
		for (let i = 0, lenList = listOFSymbols.length; i < lenList; i++) {
			let partyASP = PartyASymbolPrice.load(this.event.params.partyA.toHexString().concat('-').concat(listOFSymbols[i].toHex()))
			if (!partyASP) {
				partyASP = new PartyASymbolPrice(this.event.params.partyA.toHexString().concat('-').concat(listOFSymbols[i].toHex()))
			}
			partyASP.symbolId = listOFSymbols[i]
			partyASP.partyA = this.event.params.partyA
			partyASP.requestedOpenPrice = listOfPrices[i]
			partyASP.timeStamp = this.event.block.timestamp
			partyASP.trHash = this.event.transaction.hash
			partyASP.GlobalCounter = super.handleGlobalCounter()
			partyASP.save()
		}
	}
}
