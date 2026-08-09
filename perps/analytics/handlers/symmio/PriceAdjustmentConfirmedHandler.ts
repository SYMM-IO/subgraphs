import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { ADJUSTMENT_STATE_PRICE_ADJUSTED, loadAdjustmentSymbol, saveAdjustmentSymbol } from "../../utils/symbolAdjustment"

export class PriceAdjustmentConfirmedHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let symbol = loadAdjustmentSymbol(_event, event.params.symbolId)
		if (!symbol) return
		symbol.adjustmentState = ADJUSTMENT_STATE_PRICE_ADJUSTED
		symbol.adjustmentIndex = event.params.adjustmentIndex
		symbol.adjustmentCumulativeFactor = event.params.newCumulativeFactor
		saveAdjustmentSymbol(symbol, _event)
	}
}
