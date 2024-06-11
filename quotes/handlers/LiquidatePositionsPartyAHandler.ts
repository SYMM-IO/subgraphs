import { log } from "@graphprotocol/graph-ts"
import { LiquidatePositionsPartyAHandler as CommonLiquidatePositionsPartyAHandler } from "../../common/handlers/LiquidatePositionsPartyAHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"
import { PartyASymbolPrice, Quote } from "../../generated/schema"
import { LiquidatePositionsPartyA } from "../../generated/symmio/symmio"
import { getGlobalCounterAndInc } from "../../common/utils"

export class LiquidatePositionsPartyAHandler extends CommonLiquidatePositionsPartyAHandler {

	constructor(event: LiquidatePositionsPartyA) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		const event = super.getEvent()
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let qoutId = event.params.quoteIds[i]
			let quote = Quote.load(qoutId.toString())!
			quote.globalCounter = getGlobalCounterAndInc()
			quote.quoteStatus = 8
			let LiquidateAmount = quote.quantity!.minus(quote.closedAmount!)
			quote.liquidateAmount = LiquidateAmount
			let partyASymbolPriceEntity = PartyASymbolPrice.load(event.params.partyA.toHexString().concat('-').concat(quote.symbolId!.toHex()))
			if (partyASymbolPriceEntity) {
				quote.liquidatePrice = partyASymbolPriceEntity.requestedOpenPrice
			} else {
				log.debug(`Error in get entity liquidate requestedOpenPrice quoteId={} partyA={} symbolID={}`, [qoutId.toString(), this.event.params.partyA.toHexString(), quote.symbolId!.toString()])
			}
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, event.block.timestamp,
				'LiquidatePositionsPartyA', event.transaction.hash, event.block.number)
			quote.save()
		}
	}
}
