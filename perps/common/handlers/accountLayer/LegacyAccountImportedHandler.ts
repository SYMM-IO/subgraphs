import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { createNewAccountIfNotExists, AccountType } from "../../utils/builders"
import { SubAccount } from "../../../../generated/schema"
import { accountLayer_1 } from "../../../../generated/accountLayer_1/accountLayer_1"

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
		account.affiliate = event.params.affiliate
		account.subAccount = event.params.account.toHexString()
		account.save()

		let sub = SubAccount.load(event.params.account.toHexString())
		if (!sub) {
			sub = new SubAccount(event.params.account.toHexString())
			sub.address = event.params.account
			sub.owner = event.params.owner
			sub.affiliate = event.params.affiliate.toHexString()
			sub.singleVAMode = false
			sub.isDeleted = false
			sub.source = _event.address
			sub.timestamp = event.block.timestamp
			sub.updateTimestamp = event.block.timestamp
			sub.totalVirtualAccounts = BigInt.zero()
			sub.activeVirtualAccounts = BigInt.zero()
			sub.activePositions = BigInt.zero()
			sub.totalPositions = BigInt.zero()

			if (version == AccountLayerVersion.v_1) {
				let contract = accountLayer_1.bind(_event.address)
				let subAccountData = contract.try_getSubAccount(event.params.account)
				if (!subAccountData.reverted) {
					sub.metadata = subAccountData.value.metadata
					sub.symmioCore = subAccountData.value.symmioCore
					sub.isolationType = subAccountData.value.isolationType
					sub.name = subAccountData.value.name
					sub.singleVAMode = subAccountData.value.singleVAMode
				}
			}

			sub.save()
		}
	}
}
