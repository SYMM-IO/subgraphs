import {ethereum} from "@graphprotocol/graph-ts"
import {
	ChargeFundingRateHandler as CommonChargeFundingRateHandler
} from "../../../common/handlers/symmio/ChargeFundingRateHandler"
import {Version} from "../../../common/BaseHandler";

export class ChargeFundingRateHandler<T> extends CommonChargeFundingRateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handleQuote(_event, version)
	}
}
