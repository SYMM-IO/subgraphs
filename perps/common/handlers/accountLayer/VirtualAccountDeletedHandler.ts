import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { VirtualAccount, SubAccount } from "../../../../generated/schema"

export class VirtualAccountDeletedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let va = VirtualAccount.load(event.params.account.toHexString())
		if (va) {
			va.isDeleted = true
			va.updateTimestamp = event.block.timestamp
			va.save()

			let sub = SubAccount.load(va.parent)
			if (sub) {
				sub.activeVirtualAccounts = sub.activeVirtualAccounts.minus(BigInt.fromI32(1))
				sub.save()
			}
		}
	}
}
