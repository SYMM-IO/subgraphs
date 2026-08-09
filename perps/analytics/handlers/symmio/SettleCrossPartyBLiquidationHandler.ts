import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { settleCrossPartyBLiquidation } from "../../../common/utils/clearingHouseLiquidation"

export class SettleCrossPartyBLiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		if (version < Version.v_0_8_5) return
		// @ts-ignore
		const event = changetype<T>(_event)
		settleCrossPartyBLiquidation(event.address, event.params.partyB)
	}
}
