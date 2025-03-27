import { ethereum } from "@graphprotocol/graph-ts"
import { Symbol } from "../../../../generated/schema"
import { SetSymbolFundingState as SetSymbolFundingState_8_2 } from "../../../../generated/symmio_0_8_2/symmio_0_8_2"
import { SetSymbolFundingState as SetSymbolFundingState_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { BaseHandler, Version } from "../../BaseHandler"

export class SetSymbolFundingStateHandler<T> extends BaseHandler {
	handleSymbol(_event: ethereum.Event, version: Version): void {
		let symbol: Symbol
		if (version == Version.v_0_8_0) {
			return
		} else if (version == Version.v_0_8_2) {
			// @ts-ignore
			const e = changetype<SetSymbolFundingState_8_2>(_event)
			symbol = new Symbol(e.params.id.toString())!
			symbol.fundingRateEpochDuration = e.params.fundingRateEpochDuration
			symbol.fundingRateWindowTime = e.params.fundingRateWindowTime
		} else {
			// @ts-ignore
			const e = changetype<SetSymbolFundingState_8_3>(_event)
			symbol = new Symbol(e.params.symbolId.toString())
			symbol.fundingRateEpochDuration = e.params.fundingRateEpochDuration
			symbol.fundingRateWindowTime = e.params.fundingRateWindowTime
		}
		symbol.updateTimestamp = _event.block.timestamp
		symbol.save()
	}
}
