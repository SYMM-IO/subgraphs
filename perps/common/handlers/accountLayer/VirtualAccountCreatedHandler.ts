import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { createNewAccountIfNotExists, AccountType } from "../../utils/builders"
import { Account, VirtualAccount } from "../../../../generated/schema"

export class VirtualAccountCreatedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const parentAccount = Account.load(event.params.parent.toHexString())
		const user = parentAccount ? parentAccount.user : event.params.parent
		let account = createNewAccountIfNotExists(
			event.params.account,
			user,
			parentAccount ? parentAccount.accountSource : null,
			AccountType.NORMAL,
			event.block,
			event.transaction,
			null,
			true,
		)
		account.source = _event.address
		account.isVirtual = true
		account.parentAddress = event.params.parent
		account.subAccount = event.params.parent.toHexString()
		account.virtualAccount = event.params.account.toHexString()
		account.save()

		let va = new VirtualAccount(event.params.account.toHexString())
		va.address = event.params.account
		va.parent = event.params.parent.toHexString()
		va.isDeleted = false
		va.source = _event.address
		va.timestamp = event.block.timestamp
		va.updateTimestamp = event.block.timestamp
		va.save()
	}
}
