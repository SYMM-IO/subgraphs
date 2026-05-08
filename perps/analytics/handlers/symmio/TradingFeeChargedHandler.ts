import { TradingFeeChargedHandler as CommonTradingFeeChargedHandler } from "../../../common/handlers/symmio/TradingFeeChargedHandler"
import { Account } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"

export class TradingFeeChargedHandler<T> extends CommonTradingFeeChargedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let account = Account.load(event.params.partyA.toHexString())
		if (!account) return
		let solverAccount = Account.load(event.params.partyB.toHexString())

		let params = new UpdateHistoriesParams(version, account, solverAccount, event).symbolId(event.params.symbolId).symbolTradesCount(BigInt.zero())

		if (event.params._type == 0) params.openFee(event.params.amount)
		else params.closeFee(event.params.amount)

		updateHistories(params)
	}
}
