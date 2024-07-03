import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {getGlobalCounterAndInc} from "./utils"

export class BaseHandler {

	constructor() {
	}

	handle(_event: ethereum.Event, version: string): void {
	}

	handleQuote(_event: ethereum.Event, version: string): void {
	}

	handleAccount(_event: ethereum.Event, version: string): void {
	}

	handleSymbol(_event: ethereum.Event, version: string): void {
	}

	handleGlobalCounter(): BigInt {
		return getGlobalCounterAndInc()
	}
}