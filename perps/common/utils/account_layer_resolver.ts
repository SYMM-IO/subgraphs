import { Address, Bytes } from "@graphprotocol/graph-ts"
import { accountLayer_1 } from "../../../generated/accountLayer_1/accountLayer_1"

// Map from symmio core address (lowercase) → accountLayer address (lowercase).
// On chains in this map, when a symmio-core handler creates an UNKNOWN Account stub
// for a user (because Allocate/Deposit fired before SubAccountCreated/VirtualAccountCreated
// in the same tx), we resolve the affiliate via on-chain lookup so that
// `account.accountSource` is populated correctly the first time the account is touched.
let accountLayerMap = new Map<string, string>()
// arbitrum
accountLayerMap.set("0x8f06459f184553e5d04f07f868720bdacab39395", "0xa60ac54e18739f1c4681409383dcf881de3efabe")
// hyperevm
accountLayerMap.set("0x57331038c21982116ee9b0906e4a5c5cb52dce2e", "0x46493c376758da47823d7e3ae5d417ea6546eeb3")
// hyperevm_stage
accountLayerMap.set("0x99641e06d38f327166b3a48f86ca2cbb3b4fb7eb", "0x812e98f31a4effc09dd82e6e87ff7456151a0dfb")
// mantle
accountLayerMap.set("0x2ecc7da3cc98d341f987c85c3d9fc198570838b5", "0xba3d3982dc12acd61fe11ff08ba2164cd1c12c78")
// base_test
accountLayerMap.set("0xa805fe5baa301d4e72c789694f3967452c77d6fd", "0xe566bcdc59a644a6d71564f4e941cf93b6a37846")
// base_lc_test
accountLayerMap.set("0x0f4352e4a88b5dc0531a98b538f04893fb22489c", "0xe566bcdc59a644a6d71564f4e941cf93b6a37846")

export function resolveAccountSourceFromAccountLayer(symmioAddress: Address, account: Address): Bytes | null {
	let key = symmioAddress.toHexString()
	if (!accountLayerMap.has(key)) return null
	let layerAddr = Address.fromString(accountLayerMap.get(key))
	let contract = accountLayer_1.bind(layerAddr)

	let subResult = contract.try_getSubAccount(account)
	if (!subResult.reverted && subResult.value.isExists) {
		return subResult.value.affiliate
	}

	let vaResult = contract.try_getVirtualAccount(account)
	if (!vaResult.reverted && vaResult.value.isExists) {
		let parentResult = contract.try_getSubAccount(vaResult.value.parentAccount)
		if (!parentResult.reverted && parentResult.value.isExists) {
			return parentResult.value.affiliate
		}
	}

	return null
}
