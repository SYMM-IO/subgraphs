import { BigInt } from "@graphprotocol/graph-ts"

const FACTOR: BigInt = BigInt.fromString("1000000000000000000")

export function unDecimal(value: BigInt): BigInt {
	return value.div(FACTOR)
}
