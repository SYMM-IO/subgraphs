import {SetSymbolsPricesHandler as CommonSetSymbolsPricesHandler} from "../../common/handlers/SetSymbolsPricesHandler"

import {PartyASymbolPrice} from "../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../common/BaseHandler";

export class SetSymbolsPricesHandler<T> extends CommonSetSymbolsPricesHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)

		const listOFSymbols = event.params.symbolIds.slice(0)
		const listOfPrices = event.params.prices.slice(0)
		for (let i = 0, lenList = listOFSymbols.length; i < lenList; i++) {
			let partyASP = PartyASymbolPrice.load(event.params.partyA.toHexString().concat('-').concat(listOFSymbols[i].toHex()))
			if (!partyASP) {
				partyASP = new PartyASymbolPrice(event.params.partyA.toHexString().concat('-').concat(listOFSymbols[i].toHex()))
			}
			partyASP.symbolId = listOFSymbols[i]
			partyASP.partyA = event.params.partyA
			partyASP.requestedOpenPrice = listOfPrices[i]
			partyASP.timeStamp = event.block.timestamp
			partyASP.trHash = event.transaction.hash
			partyASP.GlobalCounter = super.handleGlobalCounter()
			partyASP.save()
		}
	}
}
