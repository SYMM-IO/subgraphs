import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Account, VirtualAccount, SubAccount } from "../../../../generated/schema"
import { accountLayer_1 } from "../../../../generated/accountLayer_1/accountLayer_1"
import { coreSourceForAccountLayer, setAccountProfileSources, setVirtualAccountProfileDefaults } from "../../utils/profile"

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
			va.lastReuseTimestamp = event.block.timestamp
			va.reuseCount = (va.reuseCount === null ? BigInt.zero() : va.reuseCount!).plus(BigInt.fromI32(1))

			if (version == AccountLayerVersion.v_1) {
				let contract = accountLayer_1.bind(_event.address)
				let virtualAccountData = contract.try_getVirtualAccount(event.params.account)
				if (!virtualAccountData.reverted) {
					va.metadata = virtualAccountData.value.metadata
					va.symbolId = virtualAccountData.value.symbolId
					va.isolationType = virtualAccountData.value.isolationType
				}
			}

			let newSub = SubAccount.load(newParent)
			let coreSource = coreSourceForAccountLayer(_event.address)
			if (newSub && newSub.coreSource) coreSource = newSub.coreSource
			setVirtualAccountProfileDefaults(va, newSub, _event.address, coreSource, _event.address)
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
				if (newSub) {
					newSub.activeVirtualAccounts = newSub.activeVirtualAccounts.plus(BigInt.fromI32(1))
					newSub.save()
				}
			}
		}

		let account = Account.load(event.params.account.toHexString())
		if (account) {
			let parentAccount = Account.load(event.params.parent.toHexString())
			let newSub = SubAccount.load(event.params.parent.toHexString())
			let coreSource = coreSourceForAccountLayer(_event.address)
			if (newSub && newSub.coreSource) coreSource = newSub.coreSource
			account.updateTimestamp = event.block.timestamp
			account.lastLayerActivityTimestamp = event.block.timestamp
			account.isDeleted = false
			account.isVirtual = true
			account.parentAddress = event.params.parent
			account.subAccount = event.params.parent.toHexString()
			account.virtualAccount = event.params.account.toHexString()
			if (parentAccount) {
				account.user = parentAccount.user
				account.userRef = parentAccount.user.toHexString()
				account.owner = parentAccount.user
				account.accountSource = parentAccount.accountSource
				account.affiliate = parentAccount.affiliate
			} else if (newSub) {
				account.user = newSub.owner
				account.userRef = newSub.owner.toHexString()
				account.owner = newSub.owner
				account.accountSource = newSub.affiliateAddress
				account.affiliate = newSub.affiliateAddress
			}
			setAccountProfileSources(account, _event.address, coreSource, _event.address)
			account.save()
		}

		let parentAccount = Account.load(event.params.parent.toHexString())
		if (parentAccount) {
			parentAccount.updateTimestamp = event.block.timestamp
			parentAccount.save()
		}
	}
}
