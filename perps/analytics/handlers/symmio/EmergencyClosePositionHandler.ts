import { EmergencyClosePositionHandler as CommonEmergencyClosePositionHandler } from "../../../common/handlers/symmio/EmergencyClosePositionHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { handleClose } from "../commonHandlers/close"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { captureQuoteFundingContext } from "../../utils/fundingHistory"

export class EmergencyClosePositionHandler<T> extends CommonEmergencyClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let fundingContext = captureQuoteFundingContext(_event, event.params.quoteId)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		handleClose<T>(_event, "EmergencyClosePosition", version, "EMERGENCY_CLOSE", fundingContext)
		updatePartyALatestBalance(_event, version, event.params.partyA)
		updatePartyBLatestBalance(_event, version, event.params.partyB, event.params.partyA)
	}
}
