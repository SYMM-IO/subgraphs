import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { createNewAccountIfNotExists, AccountType } from "../../utils/builders"
import { SubAccount } from "../../../../generated/schema"

export class SubAccountCreatedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = createNewAccountIfNotExists(
			event.params.account,
			event.params.owner,
			event.params.affiliate,
			AccountType.NORMAL,
			event.block,
			event.transaction,
			event.params.name,
			true,
		)
		account.source = _event.address
		account.isVirtual = false
		account.affiliate = event.params.affiliate
		account.subAccount = event.params.account.toHexString()
		account.save()

		let sub = new SubAccount(event.params.account.toHexString())
		sub.address = event.params.account
		sub.owner = event.params.owner
		sub.affiliate = event.params.affiliate.toHexString()
		sub.name = event.params.name
		sub.singleVAMode = false
		sub.isDeleted = false
		sub.source = _event.address
		sub.timestamp = event.block.timestamp
		sub.updateTimestamp = event.block.timestamp
		sub.save()
	}
}
