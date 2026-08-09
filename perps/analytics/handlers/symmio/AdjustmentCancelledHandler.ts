import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { ADJUSTMENT_STATE_CANCELLED, loadAdjustmentSymbol, saveAdjustmentSymbol } from "../../utils/symbolAdjustment"

export class AdjustmentCancelledHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let symbol = loadAdjustmentSymbol(_event, event.params.symbolId)
		if (!symbol) return
		symbol.adjustmentState = ADJUSTMENT_STATE_CANCELLED
		symbol.adjustmentIndex = event.params.adjustmentIndex
		saveAdjustmentSymbol(symbol, _event)
	}
}
