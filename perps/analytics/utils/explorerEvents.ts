import { ethereum } from "@graphprotocol/graph-ts"
import { LiquidationStart, TradingFeePayment, WithdrawFinalization } from "../../../generated/schema"

export function recordTradingFeePayment<T>(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	let row = new TradingFeePayment(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
	row.source = event.address
	row.quoteId = event.params.quoteId
	row.partyA = event.params.partyA
	row.partyB = event.params.partyB
	row.symbolId = event.params.symbolId
	row.affiliate = event.params.affiliate
	row.amount = event.params.amount
	row.feeType = event.params._type
	row.timestamp = event.block.timestamp
	row.blockNumber = event.block.number
	row.transaction = event.transaction.hash
	row.logIndex = event.logIndex
	row.save()
}

export function recordWithdrawFinalization<T>(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	let row = new WithdrawFinalization(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
	row.source = event.address
	row.requestId = event.params.requestId
	row.user = event.params.user
	row.timestamp = event.block.timestamp
	row.blockNumber = event.block.number
	row.transaction = event.transaction.hash
	row.logIndex = event.logIndex
	row.save()
}

export function recordLiquidationStart(event: ethereum.Event, deferred: boolean): void {
	let row = new LiquidationStart(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
	row.source = event.address
	row.liquidator = event.parameters[0].value.toAddress()
	row.partyA = event.parameters[1].value.toAddress()
	row.deferred = deferred
	// Only preserve values actually emitted by this ABI version. In particular,
	// old starts must survive when getLiquidationStateData is unavailable.
	for (let i = 2; i < event.parameters.length; i++) {
		let param = event.parameters[i]
		if (param.name == "liquidationId") row.liquidationId = param.value.toBytes()
		else if (param.name == "allocatedBalance") row.allocatedBalance = param.value.toBigInt()
		else if (param.name == "upnl") row.upnl = param.value.toBigInt()
		else if (param.name == "totalUnrealizedLoss") row.totalUnrealizedLoss = param.value.toBigInt()
		else if (param.name == "liquidationBlockNumber") row.liquidationBlockNumber = param.value.toBigInt()
		else if (param.name == "liquidationTimestamp") row.liquidationTimestamp = param.value.toBigInt()
		else if (param.name == "liquidationAllocatedBalance") row.liquidationAllocatedBalance = param.value.toBigInt()
	}
	row.timestamp = event.block.timestamp
	row.blockNumber = event.block.number
	row.transaction = event.transaction.hash
	row.logIndex = event.logIndex
	row.save()
}
