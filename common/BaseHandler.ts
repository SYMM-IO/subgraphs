import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {getGlobalCounterAndInc} from "./utils"

export enum Version {
	v_0_8_0,
	v_0_8_2,
	v_0_8_3
}

export class BaseHandler {

	constructor() {
	}

	handle(_event: ethereum.Event, version: Version): void {
	}

	handleQuote(_event: ethereum.Event, version: Version): void {
	}

	handleAccount(_event: ethereum.Event, version: Version): void {
	}

	handleSymbol(_event: ethereum.Event, version: Version): void {
	}

	handleGlobalCounter(): BigInt {
		return getGlobalCounterAndInc()
	}
}