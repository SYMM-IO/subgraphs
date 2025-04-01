import { ethereum } from "@graphprotocol/graph-ts"
import { SetSymbolFundingStateHandler as CommonSetSymbolFundingStateHandler } from "../../../common/handlers/symmio/SetSymbolFundingStateHandler"
import { Version } from "../../../common/BaseHandler"

export class SetSymbolFundingStateHandler<T> extends CommonSetSymbolFundingStateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
