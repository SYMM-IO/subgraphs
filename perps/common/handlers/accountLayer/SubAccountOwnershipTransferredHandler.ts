import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { Account, SubAccount, User, VirtualAccount } from "../../../../generated/schema"
import { accountLayer_2 } from "../../../../generated/accountLayer_2/accountLayer_2"
import { AccountLayerVersion, BaseAccountLayerHandler } from "../../BaseHandler"

export class SubAccountOwnershipTransferredHandler<T> extends BaseAccountLayerHandler {
	transferredAccountAddresses: Array<Address> = []

	handleAccount(_event: ethereum.Event, version: AccountLayerVersion): void {
		this.transferredAccountAddresses = []
		if (version < AccountLayerVersion.v_2) return

		// @ts-ignore
		const event = changetype<T>(_event)
		let contract = accountLayer_2.bind(event.address)
		let virtualAccountCountResult = contract.try_getVirtualAccountsCountOfSubAccount(event.params.account)
		if (virtualAccountCountResult.reverted) {
			log.warning("Unable to enumerate virtual accounts for transferred sub-account {}", [event.params.account.toHexString()])
			return
		}

		let virtualAccountCount = virtualAccountCountResult.value
		let virtualAccountAddressesResult = contract.try_getVirtualAccountsAddressesOfSubAccount(event.params.account, BigInt.zero(), virtualAccountCount)
		if (virtualAccountAddressesResult.reverted) {
			log.warning("Unable to load virtual-account addresses for transferred sub-account {}", [event.params.account.toHexString()])
			return
		}

		let virtualAccountAddresses = virtualAccountAddressesResult.value
		if (!virtualAccountCount.equals(BigInt.fromI32(virtualAccountAddresses.length))) {
			log.warning("Virtual-account enumeration was incomplete for transferred sub-account {}: expected {}, received {}", [
				event.params.account.toHexString(),
				virtualAccountCount.toString(),
				virtualAccountAddresses.length.toString(),
			])
			return
		}

		let subAccountId = event.params.account.toHexString()
		let subAccount = SubAccount.load(subAccountId)
		let subAccountProfile = Account.load(subAccountId)
		if (!subAccount || !subAccountProfile) {
			log.warning("Transferred sub-account hierarchy is missing its indexed profile {}", [subAccountId])
			return
		}

		// Load the complete hierarchy before mutating anything. A missing child
		// therefore cannot leave the indexed ownership graph partially updated.
		let virtualAccounts = new Array<VirtualAccount>()
		let virtualAccountProfiles = new Array<Account>()
		for (let i = 0; i < virtualAccountAddresses.length; i++) {
			let virtualAccountId = virtualAccountAddresses[i].toHexString()
			let virtualAccount = VirtualAccount.load(virtualAccountId)
			let virtualAccountProfile = Account.load(virtualAccountId)
			if (!virtualAccount || !virtualAccountProfile) {
				log.warning("Transferred sub-account {} is missing indexed virtual-account profile {}", [subAccountId, virtualAccountId])
				return
			}
			virtualAccounts.push(virtualAccount)
			virtualAccountProfiles.push(virtualAccountProfile)
		}

		let newOwnerId = event.params.newOwner.toHexString()
		let newOwner = User.load(newOwnerId)
		if (!newOwner) {
			newOwner = new User(newOwnerId)
			newOwner.address = event.params.newOwner
			newOwner.timestamp = event.block.timestamp
			newOwner.transaction = event.transaction.hash
			newOwner.globalCounter = this.handleGlobalCounter()
			newOwner.save()
		}

		subAccount.owner = event.params.newOwner
		subAccount.ownerRef = newOwnerId
		subAccount.updateTimestamp = event.block.timestamp
		subAccount.lastConfigTimestamp = event.block.timestamp
		subAccount.save()

		subAccountProfile.user = event.params.newOwner
		subAccountProfile.userRef = newOwnerId
		subAccountProfile.owner = event.params.newOwner
		subAccountProfile.updateTimestamp = event.block.timestamp
		subAccountProfile.lastLayerActivityTimestamp = event.block.timestamp
		subAccountProfile.blockNumber = event.block.number
		subAccountProfile.save()

		for (let i = 0; i < virtualAccounts.length; i++) {
			let virtualAccount = virtualAccounts[i]
			virtualAccount.owner = event.params.newOwner
			virtualAccount.ownerRef = newOwnerId
			virtualAccount.updateTimestamp = event.block.timestamp
			virtualAccount.save()

			let virtualAccountProfile = virtualAccountProfiles[i]
			virtualAccountProfile.user = event.params.newOwner
			virtualAccountProfile.userRef = newOwnerId
			virtualAccountProfile.owner = event.params.newOwner
			virtualAccountProfile.updateTimestamp = event.block.timestamp
			virtualAccountProfile.lastLayerActivityTimestamp = event.block.timestamp
			virtualAccountProfile.blockNumber = event.block.number
			virtualAccountProfile.save()
		}

		this.transferredAccountAddresses.push(event.params.account)
		for (let i = 0; i < virtualAccountAddresses.length; i++) {
			this.transferredAccountAddresses.push(virtualAccountAddresses[i])
		}
	}
}
