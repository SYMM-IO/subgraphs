import { WithdrawAcceptedHandler as CommonWithdrawAcceptedHandler } from "../../../common/handlers/symmio/WithdrawAcceptedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { loadWithdrawRequest, recordWithdrawCoreStatusHint } from "../../utils/withdrawRequest"

export class WithdrawAcceptedHandler<T> extends CommonWithdrawAcceptedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let wr = loadWithdrawRequest(event.params.user, event.params.requestId, _event.address)
		if (!wr) {
			recordWithdrawCoreStatusHint(
				_event.address,
				event.params.user,
				event.params.requestId,
				"PROVIDER_ACCEPTED",
				_event.transaction.hash,
				_event.block.timestamp,
				_event.block.number,
			)
			return
		}
		wr.status = "PROVIDER_ACCEPTED"
		wr.updateTimestamp = _event.block.timestamp
		wr.save()
	}
}
