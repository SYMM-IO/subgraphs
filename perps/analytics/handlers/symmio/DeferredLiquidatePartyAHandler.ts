import { DeferredLiquidatePartyAHandler as CommonDeferredLiquidatePartyAHandler } from "../../../common/handlers/symmio/DeferredLiquidatePartyAHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { createPartyALiquidationEvent } from "../../utils/liquidationEvent"

export class DeferredLiquidatePartyAHandler<T> extends CommonDeferredLiquidatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		createPartyALiquidationEvent(_event, event.params.partyA, event.params.liquidationId, "LIQUIDATE_PARTY_A", null)
		updatePartyALatestBalance(_event, version, event.params.partyA)
	}
}
