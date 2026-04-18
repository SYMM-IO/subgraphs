import { WithdrawFinalizedHandler as CommonWithdrawFinalizedHandler } from "../../../common/handlers/symmio/WithdrawFinalizedHandler"
import { WithdrawRequest } from "../../../../generated/schema"
import { Address, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"

export class WithdrawFinalizedHandler<T> extends CommonWithdrawFinalizedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let id = event.params.requestId.toString() + "-" + _event.address.toHexString()
		let wr = WithdrawRequest.load(id)
		if (!wr) return
		wr.status = "COMPLETED"
		wr.updateTimestamp = _event.block.timestamp
		wr.save()
		updatePartyALatestBalance(_event, version, Address.fromBytes(wr.user))
	}
}
