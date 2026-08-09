import {
	LiquidatePendingPositionsForClearingHouseHandler as CommonLiquidatePendingPositionsForClearingHouseHandler,
	resolveClearingHousePendingQuoteIds,
} from "../../../common/handlers/symmio/LiquidatePendingPositionsForClearingHouseHandler"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Quote } from "../../../../generated/schema"
import { QuoteStatus } from "../../utils/constants"
import { createQuoteEvent } from "../../utils/quoteEvent"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"

export class LiquidatePendingPositionsForClearingHouseHandler<T> extends CommonLiquidatePendingPositionsForClearingHouseHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quoteIds = resolveClearingHousePendingQuoteIds(
			version,
			event.address,
			event.params.subject,
			event.params.counterparties,
			event.params.liquidatedAmounts.length,
		)
		super.handleQuoteIds(_event, quoteIds)

		let seenPairs: Array<string> = []
		for (let i = 0; i < quoteIds.length; i++) {
			let quoteId = quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote || quote.quoteStatus != QuoteStatus.LIQUIDATED_PENDING) continue
			createQuoteEvent(_event, quoteId, "LIQUIDATE_PENDING_CLEARING_HOUSE", null)
			let partyAHex = quote.partyA.toHexString()
			let partyBHex = quote.partyB ? quote.partyB!.toHexString() : ""
			let pairKey = partyAHex + "-" + partyBHex
			if (seenPairs.includes(pairKey)) continue
			seenPairs.push(pairKey)
			updatePartyALatestBalance(_event, version, changetype<Address>(quote.partyA))
			if (quote.partyB) updatePartyBLatestBalance(_event, version, changetype<Address>(quote.partyB!), changetype<Address>(quote.partyA))
		}
	}
}
