import { ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../../generated/schema"
import { Version } from "../../../common/BaseHandler"

export class LiquidationEscrowCreatedHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let id = event.params.partyA.toHexString() + "-" + event.params.liquidationId.toHexString() + "-" + event.address.toHexString()
		let detail = LiquidationDetail.load(id)
		if (!detail) return
		detail.liquidationEscrow = event.params.amount
		detail.save()
	}
}
