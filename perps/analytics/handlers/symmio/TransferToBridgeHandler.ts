import { ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { BalanceChange } from "../../../../generated/schema"
import { TransferToBridge } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { getConfiguration } from "../../utils/builders"

export class TransferToBridgeHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<TransferToBridge>(_event)
		let bridge = new BalanceChange(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		bridge.source = event.address
		bridge.amount = event.params.amount
		bridge.account = event.params.user
		bridge.type = "BRIDGE"
		bridge.collateral = getConfiguration(event).collateral
		bridge.timestamp = event.block.timestamp
		bridge.blockNumber = event.block.number
		bridge.transaction = event.transaction.hash
		bridge.save()
	}
}
