import { BaseHandler } from "./BaseHandler"
import { AddSymbol } from "../../generated/symmio/symmio"

export class AddSymbolHandler extends BaseHandler {
	protected event: AddSymbol

	constructor(event: AddSymbol) {
		super(event)
		this.event = event
	}

	handle(): void { }
	handleQuote(): void {
		// TODO
	}
}

