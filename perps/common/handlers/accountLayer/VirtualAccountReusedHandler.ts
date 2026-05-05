import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Account, VirtualAccount, SubAccount } from "../../../../generated/schema"
import { accountLayer_1 } from "../../../../generated/accountLayer_1/accountLayer_1"

export class VirtualAccountReusedHandler<T> extends BaseAccountLayerHandler {
	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let va = VirtualAccount.load(event.params.account.toHexString())
		if (va) {
			let wasDeleted = va.isDeleted
			let oldParent = va.parent
			let newParent = event.params.parent.toHexString()

			va.isDeleted = false
			va.parent = newParent
			va.updateTimestamp = event.block.timestamp

			if (version == AccountLayerVersion.v_1) {
				let contract = accountLayer_1.bind(_event.address)
				let virtualAccountData = contract.try_getVirtualAccount(event.params.account)
				if (!virtualAccountData.reverted) {
					va.metadata = virtualAccountData.value.metadata
					va.symbolId = virtualAccountData.value.symbolId
					va.isolationType = virtualAccountData.value.isolationType
				}
			}

			va.save()

			// If the VA wasn't deleted but parent changed, decrement old parent's active count first.
			if (!wasDeleted && oldParent != newParent) {
				let oldSub = SubAccount.load(oldParent)
				if (oldSub) {
					oldSub.activeVirtualAccounts = oldSub.activeVirtualAccounts.minus(BigInt.fromI32(1))
					oldSub.save()
				}
			}

			// Only increment new parent's active count if the VA was previously deleted
			// or moved from a different parent. A spurious reuse on an already-active VA
			// pointing at the same parent is a no-op for counters.
			if (wasDeleted || oldParent != newParent) {
				let sub = SubAccount.load(newParent)
				if (sub) {
					sub.activeVirtualAccounts = sub.activeVirtualAccounts.plus(BigInt.fromI32(1))
					sub.save()
				}
			}
		}
		let account = Account.load(event.params.account.toHexString())
		if (account) {
			account.updateTimestamp = event.block.timestamp
			account.save()
		}
		let parentAccount = Account.load(event.params.parent.toHexString())
		if (parentAccount) {
			parentAccount.updateTimestamp = event.block.timestamp
			parentAccount.save()
		}
	}
}
