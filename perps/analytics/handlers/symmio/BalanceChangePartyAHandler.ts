import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account } from "../../../../generated/schema"
import { BalanceChangePartyA } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { getConfiguration } from "../../utils/builders"
import { BalanceChangeType, balanceChangeTypeName } from "../../utils/constants"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { newBalanceChange, setBalanceChangeContext } from "../../utils/balanceChange"
import { recordPartyALiquidationDeferredBalance, setPartyALiquidationPaidLf } from "../../utils/partyALiquidation"

export class BalanceChangePartyAHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<BalanceChangePartyA>(_event)
		let bc = newBalanceChange(event)
		bc.source = event.address
		bc.amount = event.params.amount
		bc.account = event.params.partyA
		bc.type = balanceChangeTypeName(event.params._type)
		bc.collateral = getConfiguration(event).collateral
		setBalanceChangeContext(bc, Account.load(event.params.partyA.toHexString()), event.address, _event.transaction.input)
		bc.timestamp = event.block.timestamp
		bc.blockNumber = event.block.number
		bc.transaction = event.transaction.hash
		bc.save()
		if (version == Version.v_0_8_6) {
			if (event.params._type == BalanceChangeType.DEFERRED_BALANCE_OUT) {
				recordPartyALiquidationDeferredBalance(_event, event.params.partyA, event.params.amount)
			} else if (event.params._type == BalanceChangeType.LF_OUT) {
				setPartyALiquidationPaidLf(_event, event.params.partyA, event.params.amount)
			}
		}
		updatePartyALatestBalance(_event, version, event.params.partyA)
	}
}
