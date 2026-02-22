
import { WithdrawCancelledHandler as CommonWithdrawCancelledHandler } from "../../../common/handlers/symmio/WithdrawCancelledHandler"
import { WithdrawRequest } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class WithdrawCancelledHandler<T> extends CommonWithdrawCancelledHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let id = event.params.requestId.toString() + "-" + _event.address.toHexString()
		let wr = WithdrawRequest.load(id)
		if (!wr) return
		wr.status = "CANCELLED"
		wr.updateTimestamp = _event.block.timestamp
		wr.save()
	}
}
