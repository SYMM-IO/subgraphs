import { SettlePartyATakeoverHandler as CommonSettlePartyATakeoverHandler } from "../../../common/handlers/symmio/SettlePartyATakeoverHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"

export class SettlePartyATakeoverHandler<T> extends CommonSettlePartyATakeoverHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		updatePartyALatestBalance(_event, version, event.params.partyA)
	}
}
