import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"

export class TradingFeeChargedHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let account = Account.load(event.params.partyA.toHexString())
		if (!account) return

		let solverAccount = Account.load(event.params.partyB.toHexString())

		let feeType = _event.parameters[6].value.toI32()
		let params = new UpdateHistoriesParams(version, account, solverAccount, event).symbolId(event.params.symbolId)

		if (feeType == 0) {
			params.openFee(event.params.amount)
		} else {
			params.closeFee(event.params.amount)
		}

		updateHistories(params)
	}
}
