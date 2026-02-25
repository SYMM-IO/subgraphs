import {
	LiquidatePartyBHandlerWithAccount as CommonLiquidatePartyBHandler
} from "../../../common/handlers/symmio/LiquidatePartyBHandlerWithAccount"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"

export class LiquidatePartyBHandler<T> extends CommonLiquidatePartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		updatePartyALatestBalance(_event, version, event.params.partyA)
		updatePartyBLatestBalance(_event, version, event.params.partyB, event.params.partyA)
	}
}
