import { ethereum } from "@graphprotocol/graph-ts"
import { BaseExpressProviderHandler, ExpressProviderVersion } from "../../../common/BaseHandler"
import { recordClearedCreditLineDebt } from "../../utils/affiliateExpressWithdrawComponents"

export class RequestDebtClearedHandler<T> extends BaseExpressProviderHandler {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		recordClearedCreditLineDebt(
			_event.address,
			event.params.affiliate,
			event.params.user,
			event.params.requestId,
			event.params.amount,
			event.params.wasActivated,
			_event.block.timestamp,
			_event.block.number,
		)
	}
}
