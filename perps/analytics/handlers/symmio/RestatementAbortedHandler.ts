import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { loadAdjustmentSymbol, saveAdjustmentSymbol } from "../../utils/symbolAdjustment"

export class RestatementAbortedHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let symbol = loadAdjustmentSymbol(_event, event.params.symbolId)
		if (!symbol) return
		symbol.restatementEpoch = event.params.epoch
		symbol.restatementFactor = BigInt.zero()
		symbol.restatementStartedAt = BigInt.zero()
		symbol.restating = false
		symbol.restatementMutated = false
		saveAdjustmentSymbol(symbol, _event)
	}
}
