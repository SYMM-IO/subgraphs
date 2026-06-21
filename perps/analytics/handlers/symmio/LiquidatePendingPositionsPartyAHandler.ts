import { LiquidatePendingPositionsPartyAHandler as CommonLiquidatePendingPositionsPartyAHandler } from "../../../common/handlers/symmio/LiquidatePendingPositionsPartyAHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createQuoteEvent } from "../../utils/quoteEvent"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { createPartyALiquidationEventFromState } from "../../utils/liquidationEvent"
import { LiquidatePendingPositionsPartyA as LiquidatePendingPositionsPartyA_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { LiquidatePendingPositionsPartyA as LiquidatePendingPositionsPartyA_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidatePendingPositionsPartyA as LiquidatePendingPositionsPartyA_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"

export class LiquidatePendingPositionsPartyAHandler<T> extends CommonLiquidatePendingPositionsPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let quoteIds: Array<BigInt>
		switch (version) {
			case Version.v_0_8_5: {
				// @ts-ignore
				let e = changetype<LiquidatePendingPositionsPartyA_0_8_5>(_event)
				quoteIds = e.params.quoteIds
				break
			}
			case Version.v_0_8_4: {
				// @ts-ignore
				let e = changetype<LiquidatePendingPositionsPartyA_0_8_4>(_event)
				quoteIds = e.params.quoteIds
				break
			}
			case Version.v_0_8_3: {
				// @ts-ignore
				let e = changetype<LiquidatePendingPositionsPartyA_0_8_3>(_event)
				quoteIds = e.params.quoteIds
				break
			}
			default: {
				quoteIds = []
				break
			}
		}

		for (let i = 0, lenQ = quoteIds.length; i < lenQ; i++) {
			createQuoteEvent(_event, quoteIds[i], "LIQUIDATE_PENDING", null)
		}
		createPartyALiquidationEventFromState(_event, version, event.params.partyA, "LIQUIDATE_PENDING_POSITIONS", null)
		updatePartyALatestBalance(_event, version, event.params.partyA)
	}
}
