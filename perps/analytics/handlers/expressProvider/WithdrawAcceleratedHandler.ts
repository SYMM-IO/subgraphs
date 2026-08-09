import { ethereum } from "@graphprotocol/graph-ts"
import { BaseExpressProviderHandler, ExpressProviderVersion } from "../../../common/BaseHandler"
import { recordExpressProviderWithdrawAccelerated } from "../../utils/affiliateExpressWithdrawComponents"

export class WithdrawAcceleratedHandler<T> extends BaseExpressProviderHandler {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		recordExpressProviderWithdrawAccelerated(
			_event.address,
			event.params.user,
			event.params.requestId,
			event.params.affiliate,
			event.params.affiliateAmount,
			event.params.creditAmount,
			event.params.generalAmount,
			_event.transaction.hash,
			_event.block.timestamp,
			_event.block.number,
		)
	}
}
