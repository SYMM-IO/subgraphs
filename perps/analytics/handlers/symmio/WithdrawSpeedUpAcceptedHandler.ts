
import { WithdrawSpeedUpAcceptedHandler as CommonWithdrawSpeedUpAcceptedHandler } from "../../../common/handlers/symmio/WithdrawSpeedUpAcceptedHandler"
import { WithdrawRequest } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class WithdrawSpeedUpAcceptedHandler<T> extends CommonWithdrawSpeedUpAcceptedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let id = event.params.requestId.toString() + "-" + _event.address.toHexString()
		let wr = WithdrawRequest.load(id)
		if (!wr) return
		wr.cooldownEndTime = event.params.newCooldown
		wr.updateTimestamp = _event.block.timestamp
		wr.save()
	}
}
