import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { ADJUSTMENT_STATE_SCHEDULED, loadAdjustmentSymbol, saveAdjustmentSymbol } from "../../utils/symbolAdjustment"

export class RestatementStartedHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let symbol = loadAdjustmentSymbol(_event, event.params.symbolId)
		if (!symbol) return
		symbol.restatementEpoch = event.params.epoch
		symbol.restatementFactor = event.params.restatementFactor
		// The direct SCHEDULED route has been frozen since effectiveTimestamp;
		// the confirmed-price route starts its continuous freeze in this block.
		symbol.restatementStartedAt =
			symbol.adjustmentState == ADJUSTMENT_STATE_SCHEDULED && symbol.adjustmentEffectiveTimestamp
				? symbol.adjustmentEffectiveTimestamp!
				: event.block.timestamp
		symbol.restating = true
		symbol.restatementMutated = false
		saveAdjustmentSymbol(symbol, _event)
	}
}
