import { Address, dataSource, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../common/BaseHandler"
import { sweepLatestAccountBalances } from "./utils/latestAccountBalance"

export function handleLatestAccountBalanceBlock(block: ethereum.Block, version: Version): void {
	let activationBlock = dataSource.context().getBigInt("latestAccountBalanceSweepActivationBlock")
	if (block.number.lt(activationBlock)) return
	let source = dataSource.address()
	sweepLatestAccountBalances(block, source, version)
}
