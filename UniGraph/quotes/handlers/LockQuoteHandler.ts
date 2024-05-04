import { LockQuoteHandler as CommonLockQuoteHandler } from "../../common/handlers/LockQuoteHandler"
import { getGlobalCounterAndInc } from "../../common/helper"
import { PartyBPartyA, Quote } from "../../generated/schema"
import { LockQuote } from "../../generated/symmio/symmio"

export class LockQuoteHandler extends CommonLockQuoteHandler {

	constructor(event: LockQuote) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		let entity = Quote.load(this.event.params.quoteId.toString())!

		let partyAPartyBEntity = PartyBPartyA.load(entity.partyA.toHexString() + '-' + this.event.params.partyB.toHexString())
		if (!partyAPartyBEntity) {
			partyAPartyBEntity = new PartyBPartyA(entity.partyA.toHexString() + '-' + this.event.params.partyB.toHexString())
			partyAPartyBEntity.quoteUntilLiquid = [this.event.params.quoteId]
		} else {
			let temp = partyAPartyBEntity.quoteUntilLiquid!.slice(0)
			temp.push(this.event.params.quoteId)
			partyAPartyBEntity.quoteUntilLiquid = temp.slice(0)
		}
		partyAPartyBEntity.globalCounter = getGlobalCounterAndInc()
		partyAPartyBEntity.save()
	}
}
