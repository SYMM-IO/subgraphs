import { Address, dataSource, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../common/BaseHandler"
import { flushLatestAccountBalanceBlockRefreshes } from "./utils/latestAccountBalance"

export function handleLatestAccountBalanceBlock(block: ethereum.Block, version: Version): void {
	let source = dataSource.address()
	flushLatestAccountBalanceBlockRefreshes(block, source, version)
}
