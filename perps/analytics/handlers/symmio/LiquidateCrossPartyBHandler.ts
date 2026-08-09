import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { activateCrossPartyBLiquidation } from "../../../common/utils/clearingHouseLiquidation"

export class LiquidateCrossPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		if (version < Version.v_0_8_5) return
		// @ts-ignore
		const event = changetype<T>(_event)
		activateCrossPartyBLiquidation(event.address, event.params.partyB)
	}
}
