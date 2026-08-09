import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import {
	ADJUSTMENT_STATE_APPLIED,
	ADJUSTMENT_STATE_PRICE_ADJUSTED,
	ADJUSTMENT_STATE_SCHEDULED,
	loadAdjustmentSymbol,
	ONE_18,
	saveAdjustmentSymbol,
} from "../../utils/symbolAdjustment"

export class RestatementFinalizedHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let symbol = loadAdjustmentSymbol(_event, event.params.symbolId)
		if (!symbol) return
		if (symbol.adjustmentState == ADJUSTMENT_STATE_PRICE_ADJUSTED || symbol.adjustmentState == ADJUSTMENT_STATE_SCHEDULED) {
			symbol.adjustmentState = ADJUSTMENT_STATE_APPLIED
		}
		symbol.adjustmentCumulativeFactor = ONE_18
		symbol.restatementEpoch = event.params.epoch
		symbol.restatementFactor = BigInt.zero()
		symbol.restatementStartedAt = BigInt.zero()
		symbol.restating = false
		symbol.restatementMutated = false
		symbol.basisVersion = (symbol.basisVersion === null ? BigInt.zero() : symbol.basisVersion!).plus(BigInt.fromI32(1))
		saveAdjustmentSymbol(symbol, _event)
	}
}
