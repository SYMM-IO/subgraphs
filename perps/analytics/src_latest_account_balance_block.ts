import { Address, dataSource, ethereum } from "@graphprotocol/graph-ts"
import { flushLatestAccountBalanceBlockRefreshes } from "./utils/latestAccountBalance"

export function handleLatestAccountBalanceBlock(block: ethereum.Block): void {
	let source = dataSource.address()
	flushLatestAccountBalanceBlockRefreshes(block, source)
}
