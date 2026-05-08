import { WithdrawInitiatedHandler as CommonWithdrawInitiatedHandler } from "../../../common/handlers/symmio/WithdrawInitiatedHandler"
import { Account, WithdrawRequest } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setWithdrawRequestProfileRefs } from "../../../common/utils/profile"
import { updateWithdrawHierarchyHistories } from "../../utils/historyHelpers"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { ZERO_ADDRESS } from "../../utils/constants"
import { addWithdrawRequestToLookup, withdrawRequestId } from "../../utils/withdrawRequest"

export class WithdrawInitiatedHandler<T> extends CommonWithdrawInitiatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let id = withdrawRequestId(event.params.user, event.params.requestId, _event.address)
		let wr = new WithdrawRequest(id)
		wr.source = _event.address
		wr.requestId = event.params.requestId
		wr.user = event.params.user
		let totalAmount = BigInt.zero()
		let parts = event.params.parts
		for (let i = 0; i < parts.length; i++) {
			totalAmount = totalAmount.plus(parts[i].amount)
		}
		wr.amount = totalAmount
		wr.speedUp = event.params.speedUp
		let hasExpress = false
		let hasVirtual = false
		for (let i = 0; i < parts.length; i++) {
			let isExpress = parts[i].expressProvider.toHexString() != ZERO_ADDRESS
			let isVirtual = parts[i].virtualProvider.toHexString() != ZERO_ADDRESS
			if (isExpress) hasExpress = true
			if (!isExpress && isVirtual) hasVirtual = true
		}
		wr.isPureVirtual = !hasExpress && hasVirtual
		wr.cooldownEndTime = event.params.cooldownEndTime
		wr.status = "PENDING"
		wr.timestamp = _event.block.timestamp
		wr.updateTimestamp = _event.block.timestamp
		wr.blockNumber = _event.block.number
		wr.transaction = _event.transaction.hash
		let account = Account.load(event.params.user.toHexString())
		setWithdrawRequestProfileRefs(wr, account, _event.address)
		if (account) {
			updateWithdrawHierarchyHistories(account, _event.block.timestamp, BigInt.fromI32(1), BigInt.fromI32(1), BigInt.zero(), totalAmount)
		}
		wr.save()
		addWithdrawRequestToLookup(wr)
		updatePartyALatestBalance(_event, version, event.params.user)
	}
}
