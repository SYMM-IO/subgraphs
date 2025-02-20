import { ethereum } from "@graphprotocol/graph-ts"
import { SetSymbolValidationStateHandler as CommonSetSymbolValidationStateHandler } from "../../../common/handlers/symmio/SetSymbolValidationStateHandler"
import { Version } from "../../../common/BaseHandler"

export class SetSymbolValidationStateHandler<T> extends CommonSetSymbolValidationStateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
