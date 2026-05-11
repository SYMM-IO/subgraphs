import { AutoTakeoverPartyALiquidationHandler as CommonAutoTakeoverPartyALiquidationHandler } from "../../../common/handlers/symmio/AutoTakeoverPartyALiquidationHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class AutoTakeoverPartyALiquidationHandler<T> extends CommonAutoTakeoverPartyALiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
