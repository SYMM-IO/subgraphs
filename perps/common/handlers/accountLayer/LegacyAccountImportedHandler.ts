import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { createNewAccountIfNotExists, AccountType } from "../../utils/builders"

export class LegacyAccountImportedHandler<T> extends BaseAccountLayerHandler {
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
			null,
			true,
		)
		account.source = _event.address
		account.isVirtual = false
		account.isDeleted = false
		account.affiliate = event.params.affiliate
		account.save()
	}
}
