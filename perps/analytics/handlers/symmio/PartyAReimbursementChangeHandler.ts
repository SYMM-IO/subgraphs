import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setPartyALiquidationReimbursement } from "../../utils/partyALiquidation"

export class PartyAReimbursementChangeHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		setPartyALiquidationReimbursement(_event, event.params.partyA, event.params.newBalance)
	}
}
