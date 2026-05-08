import { WithdrawSpeedUpAcceptedHandler as CommonWithdrawSpeedUpAcceptedHandler } from "../../../common/handlers/symmio/WithdrawSpeedUpAcceptedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { loadWithdrawRequest } from "../../utils/withdrawRequest"

export class WithdrawSpeedUpAcceptedHandler<T> extends CommonWithdrawSpeedUpAcceptedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let wr = loadWithdrawRequest(event.params.user, event.params.requestId, _event.address)
		if (!wr) return
		wr.cooldownEndTime = wr.timestamp.plus(event.params.newCooldown)
		wr.updateTimestamp = _event.block.timestamp
		wr.save()
	}
}
