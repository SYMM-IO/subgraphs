import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { Quote } from "../../../../generated/schema"
import { QuoteStatus } from "../../../analytics/utils/constants"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { LiquidatePendingPositionsPartyA as LiquidatePendingPositionsPartyA_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidatePendingPositionsPartyA as LiquidatePendingPositionsPartyA_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"

export class LiquidatePendingPositionsPartyAHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		super.handleQuote(_event, version)
		// @ts-ignore
		const event = changetype<T>(_event)
		let quoteIds: Array<BigInt>
		switch (version) {
			case Version.v_0_8_4: {
				// @ts-ignore
				const event = changetype<LiquidatePendingPositionsPartyA_0_8_4>(_event)
				quoteIds = event.params.quoteIds
				break
			}
			case Version.v_0_8_3: {
				// @ts-ignore
				const event = changetype<LiquidatePendingPositionsPartyA_0_8_3>(_event)
				quoteIds = event.params.quoteIds
				break
			}
			default: {
				quoteIds = []
				break
			}
		}
		for (let index = 0; index < quoteIds.length; index++) {
			let quote = Quote.load(quoteIds[index].toString())!
			quote.quoteStatus = QuoteStatus.LIQUIDATED_PENDING
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePendingPositionsPartyA", _event)
		}
	}

	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version)
		// @ts-ignore
		const event = changetype<T>(_event)
		createNewAccountIfNotExists(event.params.liquidator, event.params.liquidator, null, AccountType.LIQUIDATOR, event.block, event.transaction)
	}
}
