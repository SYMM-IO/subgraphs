import { ethereum } from "@graphprotocol/graph-ts"
import { VaultVersion } from "../../../common/BaseHandler"
import { WithdrawRequest } from "../../../generated/schema"
import { WithdrawRequestStatus } from "../../utils"

export class WithdrawRequestEventHandler<T> {
	handle(_event: ethereum.Event, version: VaultVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let wr = new WithdrawRequest(event.params.requestId.toString())
		wr.amount = event.params.amount
		wr.sender = event.params.sender
		wr.receiver = event.params.receiver
		wr.status = WithdrawRequestStatus.PENDING
		wr.timestamp = event.block.timestamp
		wr.source = event.address
		wr.save()
	}
}
