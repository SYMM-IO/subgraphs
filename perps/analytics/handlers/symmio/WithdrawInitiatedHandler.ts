
import { WithdrawInitiatedHandler as CommonWithdrawInitiatedHandler } from "../../../common/handlers/symmio/WithdrawInitiatedHandler"
import { WithdrawRequest } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class WithdrawInitiatedHandler<T> extends CommonWithdrawInitiatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let id = event.params.requestId.toString() + "-" + _event.address.toHexString()
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
		wr.cooldownEndTime = event.params.cooldownEndTime
		wr.status = "INITIATED"
		wr.timestamp = _event.block.timestamp
		wr.updateTimestamp = _event.block.timestamp
		wr.blockNumber = _event.block.number
		wr.transaction = _event.transaction.hash
		wr.save()
	}
}
