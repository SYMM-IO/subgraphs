import { ethereum } from "@graphprotocol/graph-ts"
import { BaseExpressProviderHandler, ExpressProviderVersion } from "../../../common/BaseHandler"
import { recordRepaidBadCreditLineDebt } from "../../utils/affiliateExpressWithdrawComponents"

export class CreditBadDebtRepaidHandler<T> extends BaseExpressProviderHandler {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		recordRepaidBadCreditLineDebt(_event.address, event.params.affiliate, event.params.amount, _event.block.timestamp, _event.block.number)
	}
}
