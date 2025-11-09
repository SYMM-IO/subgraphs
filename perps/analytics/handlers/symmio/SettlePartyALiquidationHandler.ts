import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account, CvaLf } from "../../../../generated/schema"
import { SettlePartyALiquidation } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"

export class SettlePartyALiquidationHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<SettlePartyALiquidation>(_event)

		let cvaPaid = BigInt.zero()
		const cva = CvaLf.load(event.transaction.hash.toHex() + "-6")
		if (cva) {
			cvaPaid = cva.amount
		}

		let lfPaid = BigInt.zero()
		const lf = CvaLf.load(event.transaction.hash.toHex() + "-8")
		if (lf) {
			lfPaid = lf.amount
		}

		const account = Account.load(event.params.partyA.toHexString())!
		updateHistories(new UpdateHistoriesParams(version, account, null, event).cvaPaid(cvaPaid).lfPaid(lfPaid))
	}
}
