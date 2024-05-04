import { log } from "@graphprotocol/graph-ts"
import { LiquidatePartyAHandler as CommonLiquidatePartyAHandler } from "../../common/handlers/LiquidatePartyAHandler"
import { getGlobalCounterAndInc } from "../../common/helper"
import { PartyA, Quote } from "../../generated/schema"
import { LiquidatePartyA } from "../../generated/symmio/symmio"

export class LiquidatePartyAHandler extends CommonLiquidatePartyAHandler {

	constructor(event: LiquidatePartyA) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()

		let partyAEntity = PartyA.load(this.event.params.partyA.toHexString())!
		partyAEntity.globalCounter = getGlobalCounterAndInc()
		const list = partyAEntity.quoteUntilLiquid!.slice(0)
		for (let i = 0, lenQ = list.length; i < lenQ; i++) {
			const quoteId = list[i]
			let pendingEntity = Quote.load(quoteId.toString())!
			pendingEntity.globalCounter = getGlobalCounterAndInc()
			if (pendingEntity.quoteStatus <= 2 && pendingEntity.quoteStatus >= 0) {
				pendingEntity.quoteStatus = 8
				pendingEntity.save()
			} else {
				log.error(`error in liquidate positions party A\nQuoteId: ${quoteId}\nQuote status: ${pendingEntity.quoteStatus}`, [])
			}
		}
	}
}
