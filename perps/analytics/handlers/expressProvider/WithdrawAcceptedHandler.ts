import { ethereum } from "@graphprotocol/graph-ts"
import { BaseExpressProviderHandler, ExpressProviderVersion } from "../../../common/BaseHandler"
import { recordExpressProviderWithdrawAccepted } from "../../utils/affiliateExpressWithdrawComponents"

export class WithdrawAcceptedHandler<T> extends BaseExpressProviderHandler {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		recordExpressProviderWithdrawAccepted(
			_event.address,
			event.params.user,
			event.params.requestId,
			event.params.optionType,
			_event.transaction.hash,
			_event.block.timestamp,
			_event.block.number,
		)
	}
}
