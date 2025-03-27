import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getGlobalCounterAndInc } from "./utils"

export enum Version {
	v_1,
}

export class BaseHandler {
	constructor() {}

	handle(_event: ethereum.Event, version: Version): void {}

	handleQuote(_event: ethereum.Event, version: Version): void {}

	handleAccount(_event: ethereum.Event, version: Version): void {}

	handleSymbol(_event: ethereum.Event, version: Version): void {}

	handleGlobalCounter(): BigInt {
		return getGlobalCounterAndInc()
	}
}
