import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { createNewAccountIfNotExists, AccountType } from "../../utils/builders"
import { SubAccount } from "../../../../generated/schema"
import { accountLayer_1 } from "../../../../generated/accountLayer_1/accountLayer_1"
import { ACCOUNT_KIND_SUB_ACCOUNT, initializeSubAccountCounters, setAccountProfileSources, setSubAccountProfileDefaults } from "../../utils/profile"
import { normalizeCoreSource, resolveCoreSourceFromAccountLayer } from "../../utils/account_layer_resolver"

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
		account.accountKind = ACCOUNT_KIND_SUB_ACCOUNT
		account.owner = event.params.owner
		account.userRef = event.params.owner.toHexString()
		account.lastLayerActivityTimestamp = event.block.timestamp
		account.isVirtual = false
		account.isDeleted = false
		account.affiliate = event.params.affiliate
		account.subAccount = event.params.account.toHexString()
		let coreSource: Bytes | null = null

		let subId = event.params.account.toHexString()
		let sub = SubAccount.load(subId)
		if (!sub) {
			sub = new SubAccount(subId)
			sub.timestamp = event.block.timestamp
			sub.singleVAMode = false
			sub.totalVirtualAccounts = BigInt.zero()
			sub.activeVirtualAccounts = BigInt.zero()
			sub.activePositions = BigInt.zero()
			sub.totalPositions = BigInt.zero()
			sub.latestMarginBalance = BigInt.zero()
			initializeSubAccountCounters(sub)
		}
		sub.address = event.params.account
		sub.owner = event.params.owner
		sub.affiliate = event.params.affiliate.toHexString()
		sub.name = event.params.name
		sub.isDeleted = false
		sub.source = _event.address
		sub.isLegacy = false
		sub.legacyImported = false
		sub.updateTimestamp = event.block.timestamp
		sub.lastConfigTimestamp = event.block.timestamp

		// On v0.8.5+ the SubAccountDetail struct carries singleVAMode and the
		// trio of metadata/symmioCore/isolationType. Read them once at create
		// time so the redesigned profile UI can avoid an AccountLayer RPC.
		// v2-v3 preserve the v1 getter selector and tuple layout.
		if (version == AccountLayerVersion.v_1 || version == AccountLayerVersion.v_2 || version == AccountLayerVersion.v_3) {
			let contract = accountLayer_1.bind(_event.address)
			let subAccountData = contract.try_getSubAccount(event.params.account)
			if (!subAccountData.reverted) {
				sub.metadata = subAccountData.value.metadata
				sub.symmioCore = subAccountData.value.symmioCore
				coreSource = normalizeCoreSource(subAccountData.value.symmioCore)
				sub.isolationType = subAccountData.value.isolationType
				sub.singleVAMode = subAccountData.value.singleVAMode
			}
		}
		if (coreSource === null) coreSource = resolveCoreSourceFromAccountLayer(_event.address, event.params.account)

		setSubAccountProfileDefaults(sub, event.params.owner, coreSource, _event.address)
		sub.save()
		setAccountProfileSources(account, coreSource, _event.address)
		account.save()
	}
}
