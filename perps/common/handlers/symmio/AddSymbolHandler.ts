import { BaseHandler, Version } from "../../BaseHandler"
import { Symbol } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { AddSymbol as AddSymbol_8_0 } from "../../../../generated/symmio_0_8_0/symmio_0_8_0"
import { AddSymbol as AddSymbol_8_2 } from "../../../../generated/symmio_0_8_2/symmio_0_8_2"
import { AddSymbol as AddSymbol_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"

export class AddSymbolHandler<T> extends BaseHandler {
	handleSymbol(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()
		let symbol: Symbol
		if (version == Version.v_0_8_0) {
			// @ts-ignore
			const e = changetype<AddSymbol_8_0>(_event)
			symbol = new Symbol(e.params.id.toString())
		} else if (version == Version.v_0_8_2) {
			// @ts-ignore
			const e = changetype<AddSymbol_8_2>(_event)
			symbol = new Symbol(e.params.id.toString())
			symbol.fundingRateEpochDuration = e.params.fundingRateEpochDuration
			symbol.fundingRateWindowTime = e.params.fundingRateWindowTime
		} else {
			// @ts-ignore
			const e = changetype<AddSymbol_8_3>(_event)
			symbol = new Symbol(e.params.symbolId.toString())
			symbol.fundingRateEpochDuration = e.params.fundingRateEpochDuration
			symbol.fundingRateWindowTime = e.params.fundingRateWindowTime
		}
		symbol.globalCounter = globalCounter
		symbol.name = event.params.name
		symbol.tradingFee = event.params.tradingFee
		symbol.minAcceptableQuoteValue = event.params.minAcceptableQuoteValue
		symbol.minAcceptablePortionLF = event.params.minAcceptablePortionLF
		symbol.isValid = true
		symbol.timestamp = event.block.timestamp
		symbol.updateTimestamp = event.block.timestamp
		symbol.blockNumber = event.block.number
		symbol.save()
	}
}
