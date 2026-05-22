import { ethereum } from "@graphprotocol/graph-ts"
import { BaseExpressProviderHandler, ExpressProviderVersion } from "../../../common/BaseHandler"
import { recordCancelledCreditLineDebt } from "../../utils/affiliateExpressWithdrawComponents"

export class DebtCancelledHandler<T> extends BaseExpressProviderHandler {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		recordCancelledCreditLineDebt(
			_event.address,
			event.params.affiliate,
			event.params.user,
			event.params.requestId,
			event.params.amount,
			_event.block.timestamp,
			_event.block.number,
		)
	}
}
