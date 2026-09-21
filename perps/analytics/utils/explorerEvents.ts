import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail, LiquidationStart, QuoteFeeTotals, WithdrawFinalization, WithdrawRequest } from "../../../generated/schema"
import { Version } from "../../common/BaseHandler"

export function accumulateQuoteFees<T>(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	let id = event.params.quoteId.toString() + "-" + event.address.toHexString()
	let row = QuoteFeeTotals.load(id)
	if (!row) {
		row = new QuoteFeeTotals(id)
		row.quote = id
	}
	row.source = event.address
	row.quoteId = event.params.quoteId
	row.partyA = event.params.partyA
	row.affiliate = event.params.affiliate
	if (event.params._type == 0) row.paidOpenFee = (row.paidOpenFee === null ? BigInt.zero() : row.paidOpenFee!).plus(event.params.amount)
	else row.paidCloseFee = (row.paidCloseFee === null ? BigInt.zero() : row.paidCloseFee!).plus(event.params.amount)
	row.timestamp = event.block.timestamp
	row.blockNumber = event.block.number
	row.save()
}

export function recordWithdrawFinalization<T>(_event: ethereum.Event, request: WithdrawRequest | null): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	if (request !== null) {
		request.finalizedBalanceChange = event.transaction.hash.toHexString() + "-" + event.logIndex.minus(BigInt.fromI32(1)).toString()
		request.finalizedTransaction = event.transaction.hash
		request.finalizedLogIndex = event.logIndex
		request.finalizedBlockNumber = event.block.number
		request.finalizedTimestamp = event.block.timestamp
		request.finalizedBy = event.params.user
		request.save()
		return
	}
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

export function recordLiquidationStart(event: ethereum.Event, deferred: boolean, version: Version): void {
	let partyA = event.parameters[1].value.toAddress()
	let detail: LiquidationDetail | null = null
	if (version >= Version.v_0_8_3) {
		let id = event.parameters[5].value.toBytes()
		detail = LiquidationDetail.load(partyA.toHexString() + "-" + id.toHexString() + "-" + event.address.toHexString())
	}
	// Pre-v0.8.3 starts emit no lifecycle ID. Even a successful end-of-block
	// state read can belong to a later same-block liquidation, so retain their
	// exact start evidence instead of guessing a relation and collapsing starts.
	if (detail !== null) {
		detail.liquidationStartTransaction = event.transaction.hash
		detail.startTimestamp = event.block.timestamp
		detail.startBlockNumber = event.block.number
		detail.startLogIndex = event.logIndex
		detail.deferred = deferred
		if (deferred) detail.liquidationBlockNumber = event.parameters[6].value.toBigInt()
		detail.save()
		return
	}
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
