import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getGlobalCounterAndInc } from "../utils"

export class BaseHandler {
	protected _event: ethereum.Event

	constructor(event: ethereum.Event) {
		this._event = event
	}

	handle(): void {
		// This is a generic handler. Specific event handlers will override this method.
	}

	handleGlobalCounter(): BigInt {
		return getGlobalCounterAndInc()
	}

	handleSymbol(): void {
	}

	handleUser(): void {
	}

	handleAccount(): void {
	}
}