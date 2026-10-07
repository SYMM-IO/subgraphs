import { ethereum, log } from "@graphprotocol/graph-ts"
import { SuspendedWithdrawal } from "../../../../generated/schema"
import { Version } from "../../../common/BaseHandler"
import { createSuspension, loadLatestSuspension } from "../../utils/accountSuspension"

export class WithdrawSuspendedUserHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
		if (SuspendedWithdrawal.load(id) != null) return

		let suspension = loadLatestSuspension(event.address, event.params.user)
		if (suspension == null || !suspension.isSuspended) {
			log.warning("Missing suspension start for suspended withdrawal {} on Core {} for user {}", [
				id,
				event.address.toHexString(),
				event.params.user.toHexString(),
			])
			// This event's contract function requires the user to be suspended.
			suspension = createSuspension(_event, event.params.user)
		}

		let withdrawal = new SuspendedWithdrawal(id)
		withdrawal.suspension = suspension.id
		withdrawal.source = event.address
		withdrawal.user = event.params.user
		withdrawal.admin = event.params.admin
		withdrawal.recipient = event.params.recipient
		withdrawal.amount = event.params.amount
		withdrawal.transactionHash = event.transaction.hash
		withdrawal.blockTimestamp = event.block.timestamp
		withdrawal.blockNumber = event.block.number
		withdrawal.logIndex = event.logIndex
		withdrawal.save()

		suspension.withdrawnSuspendedAmount = suspension.withdrawnSuspendedAmount.plus(event.params.amount)
		suspension.updateTimestamp = event.block.timestamp
		suspension.save()
	}
}
