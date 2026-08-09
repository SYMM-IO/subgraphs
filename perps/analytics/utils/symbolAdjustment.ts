import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Symbol } from "../../../generated/schema"

export const ADJUSTMENT_STATE_SCHEDULED = 1
export const ADJUSTMENT_STATE_PRICE_ADJUSTED = 2
export const ADJUSTMENT_STATE_APPLIED = 3
export const ADJUSTMENT_STATE_CANCELLED = 4
export const ONE_18 = BigInt.fromString("1000000000000000000")

export function loadAdjustmentSymbol(event: ethereum.Event, symbolId: BigInt): Symbol | null {
	return Symbol.load(symbolId.toString() + "-" + event.address.toHexString())
}

export function saveAdjustmentSymbol(symbol: Symbol, event: ethereum.Event): void {
	symbol.blockNumber = event.block.number
	symbol.updateTimestamp = event.block.timestamp
	symbol.save()
}

export function markSymbolRestatementMutation(event: ethereum.Event, symbolId: BigInt): void {
	let symbol = loadAdjustmentSymbol(event, symbolId)
	if (!symbol || symbol.restating != true) return
	symbol.restatementMutated = true
	saveAdjustmentSymbol(symbol, event)
}
