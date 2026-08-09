import { Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import { Account } from "../../../../generated/schema"
import { DepositForPartyBHandler } from "./DepositForPartyBHandler"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"

export class DepositForPartyBWithAccountHandler<T> extends DepositForPartyBHandler<T> {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version)

		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()

		let account = createNewAccountIfNotExists(event.params.partyB, event.params.partyB, null, AccountType.SOLVER, event.block, event.transaction)
		account.source = event.address
		account.deposit = account.deposit.plus(event.params.amount)
		account.globalCounter = globalCounter
		account.save()
	}
}
