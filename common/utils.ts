import {BigInt} from "@graphprotocol/graph-ts"
import {GlobalCounter} from "../generated/schema"


export const FACTOR: BigInt = BigInt.fromString(`1000000000000000000`)

export function getGlobalCounterAndInc(): BigInt {
	let entity = GlobalCounter.load("GLOBAL")
	if (!entity) {
		entity = new GlobalCounter("GLOBAL")
		entity.counter = BigInt.fromI32(0)
	} else {
		entity.counter = entity.counter.plus(BigInt.fromI32(1))
	}
	entity.save()
	return entity.counter
}

export function unDecimal(value: BigInt): BigInt {
	return value.div(FACTOR)
}