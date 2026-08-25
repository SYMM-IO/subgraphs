import { Address, Bytes } from "@graphprotocol/graph-ts"
import { accountLayer_1 } from "../../../generated/accountLayer_1/accountLayer_1"
import { Account, SubAccount, VirtualAccount } from "../../../generated/schema"
import { currentAccountLayerSource } from "./deploymentContext"

export function normalizeCoreSource(source: Bytes | null): Bytes | null {
	if (source === null || Address.fromBytes(source).equals(Address.zero())) return null
	return source
}

export function resolveCoreSourceFromAccountLayer(layer: Address, account: Address): Bytes | null {
	let id = account.toHexString()
	let subAccount = SubAccount.load(id)
	if (subAccount) {
		let cachedCore = normalizeCoreSource(subAccount.coreSource)
		if (cachedCore !== null) return cachedCore
	}
	let virtualAccount = VirtualAccount.load(id)
	if (virtualAccount) {
		let cachedCore = normalizeCoreSource(virtualAccount.coreSource)
		if (cachedCore !== null) return cachedCore
	}
	let profile = Account.load(id)
	if (profile) {
		let cachedCore = normalizeCoreSource(profile.coreSource)
		if (cachedCore !== null) return cachedCore
	}

	let contract = accountLayer_1.bind(layer)
	let coreResult = contract.try_getRelatedCore(account)
	if (coreResult.reverted || coreResult.value.equals(Address.zero())) return null

	if (subAccount) {
		subAccount.coreSource = coreResult.value
		subAccount.symmioCore = coreResult.value
		subAccount.save()
	}
	if (virtualAccount) {
		virtualAccount.coreSource = coreResult.value
		virtualAccount.save()
	}
	if (profile) {
		profile.coreSource = coreResult.value
		profile.accountLayerSource = layer
		profile.save()
	}
	return coreResult.value
}

export function resolveAccountSourceFromAccountLayer(account: Address): Bytes | null {
	let profile = Account.load(account.toHexString())
	if (profile && profile.accountSource) return profile.accountSource

	let layer = currentAccountLayerSource()
	if (layer === null) return null
	let contract = accountLayer_1.bind(Address.fromBytes(layer))

	let subResult = contract.try_getSubAccount(account)
	if (!subResult.reverted && subResult.value.isExists) {
		if (profile) {
			profile.accountSource = subResult.value.affiliate
			profile.save()
		}
		return subResult.value.affiliate
	}

	let vaResult = contract.try_getVirtualAccount(account)
	if (!vaResult.reverted && vaResult.value.isExists) {
		let parentResult = contract.try_getSubAccount(vaResult.value.parentAccount)
		if (!parentResult.reverted && parentResult.value.isExists) {
			if (profile) {
				profile.accountSource = parentResult.value.affiliate
				profile.save()
			}
			return parentResult.value.affiliate
		}
	}

	return null
}
