import { ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account } from "../../../../generated/schema"
import { TransferToBridge } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { getConfiguration } from "../../utils/builders"
import { newBalanceChange, setBalanceChangeContext } from "../../utils/balanceChange"

export class TransferToBridgeHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<TransferToBridge>(_event)
		let bridge = newBalanceChange(event)
		bridge.source = event.address
		bridge.amount = event.params.amount
		bridge.account = event.params.user
		bridge.type = "BRIDGE"
		bridge.collateral = getConfiguration(event).collateral
		setBalanceChangeContext(bridge, Account.load(event.params.user.toHexString()), event.address, _event.transaction.input)
		bridge.timestamp = event.block.timestamp
		bridge.blockNumber = event.block.number
		bridge.transaction = event.transaction.hash
		bridge.save()
	}
}
