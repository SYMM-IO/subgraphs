import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account } from "../../../../generated/schema"
import { BalanceChangePartyB } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { getConfiguration } from "../../utils/builders"
import { balanceChangeTypes } from "../../utils/constants"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { newBalanceChange, setBalanceChangeContext } from "../../utils/balanceChange"

export class BalanceChangePartyBHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<BalanceChangePartyB>(_event)
		let bc = newBalanceChange(event)
		bc.source = event.address
		bc.amount = event.params.amount
		bc.account = event.params.partyB
		bc.sideAccount = event.params.partyA
		bc.type = balanceChangeTypes.get(event.params._type)
		bc.collateral = getConfiguration(event).collateral
		setBalanceChangeContext(bc, Account.load(event.params.partyB.toHexString()), event.address, _event.transaction.input)
		bc.timestamp = event.block.timestamp
		bc.blockNumber = event.block.number
		bc.transaction = event.transaction.hash
		bc.save()
		updatePartyALatestBalance(_event, version, event.params.partyA)
		updatePartyBLatestBalance(_event, version, event.params.partyB, event.params.partyA)
	}
}
