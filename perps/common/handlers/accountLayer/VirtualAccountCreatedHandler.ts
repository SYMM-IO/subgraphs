import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { createNewAccountIfNotExists, AccountType } from "../../utils/builders"
import { Account, VirtualAccount, SubAccount } from "../../../../generated/schema"
import { accountLayer_1 } from "../../../../generated/accountLayer_1/accountLayer_1"

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
		va.totalPositions = BigInt.zero()
		va.activePositions = BigInt.zero()

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

		let sub = SubAccount.load(event.params.parent.toHexString())
		if (sub) {
			sub.totalVirtualAccounts = sub.totalVirtualAccounts.plus(BigInt.fromI32(1))
			sub.activeVirtualAccounts = sub.activeVirtualAccounts.plus(BigInt.fromI32(1))
			sub.save()
		}
	}
}
