import {ethereum, log} from "@graphprotocol/graph-ts"
import {
	LiquidatePositionsPartyAHandler as CommonLiquidatePositionsPartyAHandler
} from "../../../common/handlers/symmio/LiquidatePositionsPartyAHandler"
import {PartyASymbolPrice, Quote} from "../../../generated/schema"
import {Version} from "../../../common/BaseHandler";

export class LiquidatePositionsPartyAHandler<T> extends CommonLiquidatePositionsPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let qoutId = event.params.quoteIds[i]
			let quote = Quote.load(qoutId.toString())!
			quote.globalCounter = super.handleGlobalCounter()
			let partyASymbolPriceEntity = PartyASymbolPrice.load(event.params.partyA.toHexString().concat('-').concat(quote.symbolId!.toHex()))
			if (partyASymbolPriceEntity) {
				quote.liquidatePrice = partyASymbolPriceEntity.requestedOpenPrice
			} else {
				log.debug(`Error in get entity liquidate requestedOpenPrice quoteId={} partyA={} symbolID={}`, [qoutId.toString(), event.params.partyA.toHexString(), quote.symbolId!.toString()])
			}
			quote.save()
		}
	}
}
