import { ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account, BridgeTransaction } from "../../../../generated/schema"
import { TransferToBridge } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { getConfiguration } from "../../utils/builders"
import { newBalanceChange, setBalanceChangeContext } from "../../utils/balanceChange"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"

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
		let transaction = new BridgeTransaction(event.params.transactionId.toString() + "-" + event.address.toHexString())
		transaction.source = event.address
		transaction.transactionId = event.params.transactionId
		transaction.bridge = event.params.bridgeAddress
		transaction.balanceChange = bridge.id
		transaction.save()
		updatePartyALatestBalance(_event, version, event.params.user)
	}
}
