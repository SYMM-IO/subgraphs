import { BaseHandler } from "./BaseHandler"
import { AcceptCancelCloseRequest, symmio } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { initialHelper, setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { ethereum, log } from "@graphprotocol/graph-ts"
import { getGlobalCounterAndInc, symbolIdToSymbolName } from "../utils"

export class AcceptCancelCloseRequestHandler extends BaseHandler {
	protected event: AcceptCancelCloseRequest

	constructor(event: AcceptCancelCloseRequest) {
		super(event)
		this.event = event
	}

	protected getEvent(): AcceptCancelCloseRequest {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())
		if (quote) {

			quote.globalCounter = getGlobalCounterAndInc()
			quote.quoteStatus = this.event.params.quoteStatus
			quote.blockNumber = this.event.block.number
			quote.timeStamp = this.event.block.timestamp
			quote.save()

			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
				'AcceptCancelCloseRequest', this.event.transaction.hash)
		} else {
			let newEntity = new Quote(this.event.params.quoteId.toString())
			newEntity.globalCounter = getGlobalCounterAndInc()
			newEntity.quoteId = this.event.params.quoteId
			newEntity.quoteStatus = this.event.params.quoteStatus
			newEntity.timeStamp = this.event.block.timestamp
			let symmioContract = symmio.bind(this.event.address)
			let callResult = symmioContract.try_getQuote(this.event.params.quoteId)
			if (callResult.reverted) {
				log.error('accept cancel bind crashed!', [])
			} else {
				let Result = callResult.value as ethereum.Tuple
				let initialNewEntity = initialHelper(Result)
				if (initialNewEntity) {

					const symbol = symbolIdToSymbolName(initialNewEntity.symbolId, this.event.address)
					if (symbol) {
						initialNewEntity.symbol = symbol
					}
				}
				initialNewEntity.save()
				newEntity.partyA = initialNewEntity.partyA
				newEntity.tradingFee = initialNewEntity.tradingFee!
				newEntity.initialData = initialNewEntity.id
			}
			setEventTimestampAndTransactionHashAndAction(newEntity.eventsTimestamp, this.event.block.timestamp,
				'AcceptCancelCloseRequest', this.event.transaction.hash, this.event.block.number)

			newEntity.save()
		}
	}
}