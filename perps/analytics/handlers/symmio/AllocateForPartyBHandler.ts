import { AllocateForPartyBHandler as CommonAllocateForPartyBHandler } from "../../../common/handlers/symmio/AllocateForPartyBWithAccountHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Account, BalanceChange } from "../../../../generated/schema"
import { BalanceChangeType, balanceChangeTypes } from "../../utils/constants"
import { getConfiguration } from "../../utils/builders"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { setBalanceChangeContext } from "../../utils/balanceChange"

export class AllocateForPartyBHandler<T> extends CommonAllocateForPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		// @ts-ignore
		const event = changetype<T>(_event)

		if (version < Version.v_0_8_3) {
			let allocate = new BalanceChange(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
			allocate.source = event.address
			allocate.type = balanceChangeTypes.get(BalanceChangeType.ALLOCATE)
			allocate.timestamp = event.block.timestamp
			allocate.blockNumber = event.block.number
			allocate.transaction = event.transaction.hash
			allocate.amount = event.params.amount
			allocate.account = event.params.partyB
			allocate.sideAccount = event.params.partyA
			allocate.collateral = getConfiguration(event).collateral
			setBalanceChangeContext(allocate, Account.load(event.params.partyB.toHexString()), event.address, _event.transaction.input)
			allocate.save()
		}
		updatePartyALatestBalance(_event, version, event.params.partyA)
		updatePartyBLatestBalance(_event, version, event.params.partyB, event.params.partyA)
	}
}
