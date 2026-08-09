import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { ADJUSTMENT_STATE_SCHEDULED, loadAdjustmentSymbol, saveAdjustmentSymbol } from "../../utils/symbolAdjustment"

export class AdjustmentScheduledHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let symbol = loadAdjustmentSymbol(_event, event.params.symbolId)
		if (!symbol) return
		symbol.adjustmentState = ADJUSTMENT_STATE_SCHEDULED
		symbol.adjustmentIndex = event.params.adjustmentIndex
		symbol.adjustmentFactor = event.params.factor
		symbol.adjustmentEffectiveTimestamp = event.params.effectiveTimestamp
		saveAdjustmentSymbol(symbol, _event)
	}
}
