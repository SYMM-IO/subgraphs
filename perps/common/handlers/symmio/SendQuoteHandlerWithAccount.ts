import { Version } from "../../BaseHandler"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { SendQuoteHandler } from "./SendQuoteHandler"
import { Account } from "../../../../generated/schema"
import { AccountType, accountTypes, createNewAccountIfNotExists } from "../../utils/builders"
import { getAccountName, getAccountOwner } from "../../../analytics/utils/multiAccountHelper"

export class SendQuoteHandlerWithAccount<T> extends SendQuoteHandler<T> {
	handleAccount(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.partyA.toHexString())
		if (!account) return
		if (account.type == accountTypes.get(AccountType.UNKNOWN)) {
			let userAddress = getAccountOwner(event.address, Address.fromBytes(account.account))
			if (userAddress) {
				let accountName = getAccountName(event.address, userAddress, Address.fromBytes(account.account))
				account = createNewAccountIfNotExists(
					event.params.partyA,
					userAddress,
					event.address,
					AccountType.NORMAL,
					event.block,
					event.transaction,
					accountName,
					true,
				)
				account.source = event.address
			}
		}
		account.quotesCount = account.quotesCount.plus(BigInt.fromString("1"))
		account.save()
	}
}
