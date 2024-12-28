import { ethereum } from "@graphprotocol/graph-ts"
import { VaultVersion } from "../../../common/BaseHandler"
import { WithdrawRequest } from "../../../generated/schema"
import { WithdrawRequestStatus } from "../../utils"

export class WithdrawRequestCanceledHandler<T> {
	handle(_event: ethereum.Event, version: VaultVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let wr = WithdrawRequest.load(event.params.requestId.toString())!
		wr.status = WithdrawRequestStatus.CANCELED
		wr.save()
	}
}
