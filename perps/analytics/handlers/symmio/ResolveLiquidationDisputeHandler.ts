import { ResolveLiquidationDisputeHandler as CommonResolveLiquidationDisputeHandler } from "../../../common/handlers/symmio/ResolveLiquidationDisputeHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createPartyALiquidationEvent } from "../../utils/liquidationEvent"

export class ResolveLiquidationDisputeHandler<T> extends CommonResolveLiquidationDisputeHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		if (version >= Version.v_0_8_3) createPartyALiquidationEvent(_event, event.params.partyA, event.params.liquidationId, "RESOLVE_DISPUTE", null)
	}
}
