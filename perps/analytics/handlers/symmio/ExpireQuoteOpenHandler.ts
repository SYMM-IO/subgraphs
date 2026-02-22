import { ExpireQuoteOpenHandler as CommonExpireQuoteOpenHandler } from "../../../common/handlers/symmio/ExpireQuoteOpenHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class ExpireQuoteOpenHandler<T> extends CommonExpireQuoteOpenHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
