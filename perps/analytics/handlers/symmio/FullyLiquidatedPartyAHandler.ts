
import { FullyLiquidatedPartyAHandler as CommonFullyLiquidatedPartyAHandler } from "../../../common/handlers/symmio/FullyLiquidatedPartyAHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class FullyLiquidatedPartyAHandler<T> extends CommonFullyLiquidatedPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
