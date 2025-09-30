import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { SYMMIO_SHARE_DEFAULT, ZERO_ADDRESS_BYTES } from "./constants";
import { unDecimal } from "./common"
import { feeCollector_1 } from "../../../generated/feeCollector_1/feeCollector_1"
import { AffiliateFeeCollector, FeeCollectorShare } from "../../../generated/schema"

export function getSymmioSharePercent(address: Address): BigInt | null {
	const contract = feeCollector_1.bind(address)
	let result = contract.try_symmioShare()
	return result.reverted ? null : result.value
}

export function getSymmioShare(affiliate: Bytes | null, fee: BigInt): BigInt {
	let affAddr = affiliate === null ? ZERO_ADDRESS_BYTES : affiliate
	let affFeeCol = AffiliateFeeCollector.load(affAddr.toHexString())
	if (!affFeeCol) return fee.times(SYMMIO_SHARE_DEFAULT).div(BigInt.fromI32(100))
	let feeColShare = FeeCollectorShare.load(affFeeCol.feeCollector.toHexString())!
	if (feeColShare.symmioShare) return fee.times(unDecimal(feeColShare.symmioShare!).div(BigInt.fromI32(100)))
	else return fee.times(SYMMIO_SHARE_DEFAULT).div(BigInt.fromI32(100))
}
