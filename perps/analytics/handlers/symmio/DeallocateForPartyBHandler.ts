import { DeallocateForPartyBHandler as CommonDeallocateForPartyBHandler } from "../../../common/handlers/symmio/DeallocateForPartyBWithAccountHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Account } from "../../../../generated/schema"
import { BalanceChangeType, balanceChangeTypes } from "../../utils/constants"
import { getConfiguration } from "../../utils/builders"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { newBalanceChange, setBalanceChangeContext } from "../../utils/balanceChange"

export class DeallocateForPartyBHandler<T> extends CommonDeallocateForPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		// @ts-ignore
		const event = changetype<T>(_event)

		if (version < Version.v_0_8_3) {
			let deallocate = newBalanceChange(event)
			deallocate.source = event.address
			deallocate.type = balanceChangeTypes.get(BalanceChangeType.DEALLOCATE)
			deallocate.timestamp = event.block.timestamp
			deallocate.blockNumber = event.block.number
			deallocate.transaction = event.transaction.hash
			deallocate.amount = event.params.amount
			deallocate.account = event.params.partyB
			deallocate.sideAccount = event.params.partyA
			deallocate.collateral = getConfiguration(event).collateral
			setBalanceChangeContext(deallocate, Account.load(event.params.partyB.toHexString()), event.address, _event.transaction.input)
			deallocate.save()
		}
		updatePartyALatestBalance(_event, version, event.params.partyA)
		updatePartyBLatestBalance(_event, version, event.params.partyB, event.params.partyA)
	}
}
