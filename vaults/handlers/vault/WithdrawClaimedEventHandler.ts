import { ethereum } from "@graphprotocol/graph-ts"
import { VaultVersion } from "../../../common/BaseHandler"
import { WithdrawRequest } from "../../../generated/schema"
import { WithdrawRequestStatus } from "../../utils"

export class WithdrawClaimedEventHandler<T> {
	handle(_event: ethereum.Event, version: VaultVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let wr = WithdrawRequest.load(event.params.requestId.toString())!
		wr.receiver = event.params.receiver
		wr.status = WithdrawRequestStatus.DONE
		wr.save()
	}
}
