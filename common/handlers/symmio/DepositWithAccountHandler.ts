import {Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";
import {Account} from "../../../generated/schema";
import {newUserAndAccount} from "../../../analytics/utils/builders";
import {DepositHandler} from "./DepositHandler";

export class DepositWithAccountHandler<T> extends DepositHandler<T> {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version);
		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()

		newUserAndAccount(event.params.user, event.block, event.transaction)
		let account = Account.load(event.params.user.toHexString())!
		account.deposit = account.deposit.plus(event.params.amount)
		account.globalCounter = globalCounter
		account.save()
	}
}