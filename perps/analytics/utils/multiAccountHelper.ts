import { Address, BigInt } from "@graphprotocol/graph-ts"
import { symmioMultiAccount_2 } from "../../../generated/symmioMultiAccount_2/symmioMultiAccount_2";

export function getAccountOwner(affiliate: Address, account: Address): Address | null {
	const contract = symmioMultiAccount_2.bind(affiliate)
	let result = contract.try_owners(account)
	return result.reverted ? null : result.value
}

export function getAccountName(affiliate: Address, user: Address, account: Address): string | null {
	const contract = symmioMultiAccount_2.bind(affiliate)
	let result = contract.try_getAccounts(user, BigInt.zero(), BigInt.fromI32(1000))
	if (result.reverted) return null
	const accounts = result.value
	for (let i = 0; i < accounts.length; i++) {
		if (accounts[i].accountAddress == account) return accounts[i].name
	}
	return null
}
