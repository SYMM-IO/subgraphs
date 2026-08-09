import { SettlePartyATakeoverHandler as CommonSettlePartyATakeoverHandler } from "../../../common/handlers/symmio/SettlePartyATakeoverHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { settlePartyATakeover as clearPartyATakeoverContext } from "../../../common/utils/clearingHouseLiquidation"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { clearPartyALiquidationTracking, reconcileCompletedPartyALiquidation } from "../../utils/partyALiquidation"

export class SettlePartyATakeoverHandler<T> extends CommonSettlePartyATakeoverHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		if (version == Version.v_0_8_6) {
			reconcileCompletedPartyALiquidation(event.address, event.params.partyA, event.params.liquidationId)
		}
		super.handle(_event, version)
		if (version >= Version.v_0_8_5) clearPartyATakeoverContext(event.address, event.params.partyA)
		if (version == Version.v_0_8_6) clearPartyALiquidationTracking(event.address, event.params.partyA)
		updatePartyALatestBalance(_event, version, event.params.partyA)
	}
}
