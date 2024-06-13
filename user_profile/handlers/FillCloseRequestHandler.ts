import { BigInt } from "@graphprotocol/graph-ts"
import { FillCloseRequestHandler as CommonFillCloseRequestHandler } from "../../common/handlers/FillCloseRequestHandler"
import { FillCloseRequest } from "../../generated/symmio/symmio"
import { handleClose } from "./handleClose"

export class FillCloseRequestHandler extends CommonFillCloseRequestHandler {

	constructor(event: FillCloseRequest) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
		let event = super.getEvent()

		handleClose(event, 'FillCloseRequest')
	}
}
