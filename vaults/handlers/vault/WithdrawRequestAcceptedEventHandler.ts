import { ethereum } from "@graphprotocol/graph-ts"
import { VaultVersion } from "../../../common/BaseHandler"
import { WithdrawRequest } from "../../../generated/schema"
import { WithdrawRequestStatus } from "../../utils"

export class WithdrawRequestAcceptedEventHandler<T> {
	handle(_event: ethereum.Event, version: VaultVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0; i < event.params.acceptedRequestIds.length; i++) {
			let wr = WithdrawRequest.load(event.params.acceptedRequestIds[i].toString())!
			wr.paybackRatio = event.params.paybackRatio
			wr.status = WithdrawRequestStatus.READY
			wr.save()
		}
	}
}
