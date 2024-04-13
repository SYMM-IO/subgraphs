import { FillCloseRequest } from "../../generated/symmio/symmio"
import { BaseHandler } from "./BaseHandler"

export class FillCloseRequestHandler extends BaseHandler {
	private event: FillCloseRequest

	constructor(event: FillCloseRequest) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}