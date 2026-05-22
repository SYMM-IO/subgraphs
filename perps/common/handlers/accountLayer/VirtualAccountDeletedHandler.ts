import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Account, VirtualAccount, SubAccount } from "../../../../generated/schema"

export class VirtualAccountDeletedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let va = VirtualAccount.load(event.params.account.toHexString())
		if (va) {
			va.isDeleted = true
			va.updateTimestamp = event.block.timestamp
			va.lastDeleteTimestamp = event.block.timestamp
			va.save()

			let sub = SubAccount.load(va.parent)
			if (sub) {
				sub.activeVirtualAccounts = sub.activeVirtualAccounts.minus(BigInt.fromI32(1))
				sub.save()
			}
		}

		let account = Account.load(event.params.account.toHexString())
		if (account) {
			account.isDeleted = true
			account.updateTimestamp = event.block.timestamp
			account.lastLayerActivityTimestamp = event.block.timestamp
			account.save()
		}
	}
}
