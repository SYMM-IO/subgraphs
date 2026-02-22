
import { WithdrawCancelRequestedHandler as CommonWithdrawCancelRequestedHandler } from "../../../common/handlers/symmio/WithdrawCancelRequestedHandler"
import { WithdrawRequest } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class WithdrawCancelRequestedHandler<T> extends CommonWithdrawCancelRequestedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let id = event.params.requestId.toString() + "-" + _event.address.toHexString()
		let wr = WithdrawRequest.load(id)
		if (!wr) return
		wr.status = "CANCEL_REQUESTED"
		wr.updateTimestamp = _event.block.timestamp
		wr.save()
	}
}
