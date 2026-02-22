import { FillCloseRequestHandler as CommonFillCloseRequestHandler } from "../../../common/handlers/symmio/FillCloseRequestHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { handleClose } from "../commonHandlers/close"

export class FillCloseRequestHandler<T> extends CommonFillCloseRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		handleClose<T>(_event, "FillCloseRequest", version, "FILL_CLOSE")
	}
}
