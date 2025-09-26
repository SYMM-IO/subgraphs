import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { feeCollector_1 } from "../../../generated/feeCollector_1/feeCollector_1"
import { AffiliateFeeCollector, FeeCollectorShare } from "../../../generated/schema";
import { ZERO_ADDRESS_BYTES } from "./constants";

export function unDecimal(value: BigInt): BigInt {
	return value.div(BigInt.fromString("10").pow(18))
}

export function getSymmioSharePercent(address: Address): BigInt | null {
	const contract = feeCollector_1.bind(address)
	let result = contract.try_symmioShare()
	return result.reverted ? null : result.value
}

export function getSymmioShare(affiliate: Bytes | null, fee:BigInt): BigInt {
	let affAddr = affiliate === null ? ZERO_ADDRESS_BYTES : affiliate
	let affFeeCol = AffiliateFeeCollector.load(affAddr.toHexString())
	if (!affFeeCol) return fee.div(BigInt.fromI32(2))
	let feeColShare = FeeCollectorShare.load(affFeeCol.feeCollector.toHexString())!
	if (feeColShare.symmioShare) return fee.times(unDecimal(feeColShare.symmioShare!).div(BigInt.fromI32(100)))
	else return fee.div(BigInt.fromI32(2))
}
