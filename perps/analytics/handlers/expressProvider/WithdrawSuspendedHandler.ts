import { ethereum } from "@graphprotocol/graph-ts"
import { BaseExpressProviderHandler, ExpressProviderVersion } from "../../../common/BaseHandler"
import { recordExpressProviderWithdrawStatus } from "../../utils/affiliateExpressWithdrawComponents"

export class WithdrawSuspendedHandler<T> extends BaseExpressProviderHandler {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		recordExpressProviderWithdrawStatus(
			_event.address,
			event.params.user,
			event.params.requestId,
			"SUSPENDED",
			_event.transaction.hash,
			_event.block.timestamp,
			_event.block.number,
		)
	}
}
