import { ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { recordWithdrawAdvanced } from "../../utils/affiliateExpressWithdrawComponents"

export class WithdrawAdvancedHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		recordWithdrawAdvanced(
			_event.address,
			event.params.user,
			event.params.requestId,
			event.params.amount,
			_event.transaction.hash,
			_event.block.timestamp,
			_event.block.number,
		)
	}
}
