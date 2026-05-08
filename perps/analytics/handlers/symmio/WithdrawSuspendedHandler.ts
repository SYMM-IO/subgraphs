import { WithdrawSuspendedHandler as CommonWithdrawSuspendedHandler } from "../../../common/handlers/symmio/WithdrawSuspendedHandler"
import { Account } from "../../../../generated/schema"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { updateWithdrawHierarchyHistories } from "../../utils/historyHelpers"
import { loadWithdrawRequest, removeWithdrawRequestFromLookup } from "../../utils/withdrawRequest"

export class WithdrawSuspendedHandler<T> extends CommonWithdrawSuspendedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let wr = loadWithdrawRequest(event.params.user, event.params.requestId, _event.address)
		if (!wr) return
		wr.status = "SUSPENDED"
		wr.updateTimestamp = _event.block.timestamp
		let account = Account.load(wr.user.toHexString())
		if (account) {
			updateWithdrawHierarchyHistories(account, _event.block.timestamp, BigInt.zero(), BigInt.fromI32(-1), BigInt.zero(), wr.amount.neg())
		}
		wr.save()
		removeWithdrawRequestFromLookup(wr)
		updatePartyALatestBalance(_event, version, Address.fromBytes(wr.user))
	}
}
