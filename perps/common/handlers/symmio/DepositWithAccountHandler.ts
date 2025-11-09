import { Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import { DepositHandler } from "./DepositHandler"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { BigInt } from "@graphprotocol/graph-ts"

export class DepositWithAccountHandler<T> extends DepositHandler<T> {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version)
		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()

		let account = createNewAccountIfNotExists(event.params.user, event.params.user, null, AccountType.UNKNOWN, event.block, event.transaction)
		account.source = event.address
		if (
			event.transaction.hash.toHexString() == "0xd87280448339c9bec39f98ea17e7371f13562b8b446863db7ee8f4ce53261c71" &&
			event.block.number == BigInt.fromI32(35228647) &&
			event.address.toHexString() == "0xc6a7cc26fd84ae573b705423b7d1831139793025"
		)
			account.deposit = account.deposit.plus(event.params.amount.div(BigInt.fromString("1000000000000")))
		else account.deposit = account.deposit.plus(event.params.amount)

		account.globalCounter = globalCounter
		account.save()
	}
}
