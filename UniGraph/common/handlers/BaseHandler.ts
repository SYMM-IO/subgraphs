import { ethereum } from "@graphprotocol/graph-ts"

export class BaseHandler {
	_event: ethereum.Event

	constructor(event: ethereum.Event) {
		this._event = event
	}

	handle(): void {
		// This is a generic handler. Specific event handlers will override this method.
	}
}