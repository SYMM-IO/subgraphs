import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { MultiAccountVersion } from "../BaseHandler"
import { symmioMultiAccount_2 } from "../../../generated/symmioMultiAccount_2/symmioMultiAccount_2"
import { symmioMultiAccount_3 } from "../../../generated/symmioMultiAccount_3/symmioMultiAccount_3"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
let sourceMap = new Map<string, string>()

// base
sourceMap.set("0x5de6949717f3aa8e0fbed5ce8b611ebcf1e44ae9", "0x52e2230cdb80edebdadafcf24033608c9a636d7d")

// bnb
sourceMap.set("0x058ba7574d8bc66f1a1dcc44bb5b18894d4190e0", "0x059a8ad9fefae3818bccb5811d1bf9688ca9137c")
sourceMap.set("0x10acc15db0d432280be4885dae65e1cc76da3c54", "0x059a8ad9fefae3818bccb5811d1bf9688ca9137c")

// ftm
sourceMap.set("0x0937bc09b8d073e4f1abe85470969475f714ca6c", "0x762407bed807184f90f3edcf2d7ac9cb9d8901c6")

export function getDiamond(address: Address): Bytes {
	const contract = symmioMultiAccount_2.bind(address)
	return contract.symmioAddress()
}

export function getVibeDiamond<T>(_event: ethereum.Event): Bytes {
	// @ts-ignore
	const event = changetype<T>(_event)
	const contract = symmioMultiAccount_3.bind(event.address)
	let result = contract.try_getVibeAccount(event.params.account)
	return result.reverted ? Bytes.fromHexString(ZERO_ADDRESS) : result.value.data.symmioAddress
}

export function getSource<T>(event: ethereum.Event, version: MultiAccountVersion): Bytes {
	switch (version) {
		case MultiAccountVersion.v_1:
			return Bytes.fromHexString(sourceMap.get(event.address.toHexString()))
		case MultiAccountVersion.v_2:
			return getDiamond(event.address)
		case MultiAccountVersion.v_3:
			return getVibeDiamond<T>(event)
		default:
			return Bytes.fromHexString(ZERO_ADDRESS)
	}
}
