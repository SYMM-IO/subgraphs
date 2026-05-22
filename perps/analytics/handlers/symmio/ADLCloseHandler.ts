import { ADLCloseHandler as CommonADLCloseHandler } from "../../../common/handlers/symmio/ADLCloseHandler"
import { Address, ethereum, log } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { DebugEntity, Quote } from "../../../../generated/schema"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { syncFundingFeeState } from "../../utils/fundingFeeState"

export class ADLCloseHandler<T> extends CommonADLCloseHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) {
			log.debug("quote not exist. quoteId {}", [event.params.quoteId.toString()])
			let db = new DebugEntity("ADLClose-quote-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quote not exist. quoteId ${event.params.quoteId.toString()}`
			db.save()
			return
		}

		if (quote.partyB !== null && quote.symbolId !== null) {
			syncFundingFeeState(_event, version, quote.symbolId!, changetype<Address>(quote.partyB!))
		}

		createQuoteEvent(
			_event,
			event.params.quoteId,
			"ADL_CLOSE",
			new JSONBuilder()
				.add("amount", event.params.amount.toString())
				.add("openedPrice", quote.openedPrice!.toString())
				.add("closePrice", event.params.price.toString())
				.build(),
		)
		updatePartyALatestBalance(_event, version, changetype<Address>(quote.partyA))
		if (quote.partyB) updatePartyBLatestBalance(_event, version, changetype<Address>(quote.partyB!), changetype<Address>(quote.partyA))
	}
}
