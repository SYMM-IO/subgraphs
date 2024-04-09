import {BaseHandler} from "./BaseHandler"

export class FillCloseRequestHandler extends BaseHandler {
	private event: FillCloseRequestEvent

	constructor(event: FillCloseRequestEvent) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}