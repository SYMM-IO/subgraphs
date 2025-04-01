import {Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";
import {DepositHandler} from "./DepositHandler";
import {AccountType, createNewAccountIfNotExists} from "../../utils/builders";

export class DepositWithAccountHandler<T> extends DepositHandler<T> {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version);
		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()

		let account = createNewAccountIfNotExists(event.params.user, event.params.user, null, AccountType.UNKNOWN, event.block, event.transaction)
		account.deposit = account.deposit.plus(event.params.amount)
		account.globalCounter = globalCounter
		account.save()
	}
}