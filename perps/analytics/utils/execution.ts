import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { BalanceChange, LiquidationExecution, Quote, WithdrawRequest } from "../../../generated/schema"
import { Version } from "../../common/BaseHandler"

export function accumulateQuoteFees<T>(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	let id = event.params.quoteId.toString() + "-" + event.address.toHexString()
	let quote = Quote.load(id)
	if (!quote) {
		log.warning("Cannot record trading fees for missing quote {} at {}-{}; reindex from contract start", [
			id,
			event.transaction.hash.toHexString(),
			event.logIndex.toString(),
		])
		return
	}
	quote.feeAffiliate = event.params.affiliate
	if (event.params._type == 0) quote.paidOpenFee = (quote.paidOpenFee === null ? BigInt.zero() : quote.paidOpenFee!).plus(event.params.amount)
	else quote.paidCloseFee = (quote.paidCloseFee === null ? BigInt.zero() : quote.paidCloseFee!).plus(event.params.amount)
	quote.save()
}

function newLiquidationExecution(event: ethereum.Event): LiquidationExecution {
	let execution = new LiquidationExecution(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
	execution.source = event.address
	execution.liquidator = event.parameters[0].value.toAddress()
	execution.partyA = event.parameters[1].value.toAddress()
	execution.timestamp = event.block.timestamp
	execution.blockNumber = event.block.number
	execution.transaction = event.transaction.hash
	execution.logIndex = event.logIndex
	return execution
}

export function recordLiquidationStart(event: ethereum.Event, deferred: boolean, version: Version): void {
	// Modern cores emit the lifecycle ID, even when historical state reads fail.
	if (version < Version.v_0_8_3) return
	let execution = newLiquidationExecution(event)
	execution.type = deferred ? "DEFERRED_START" : "START"
	execution.liquidationId = event.parameters[5].value.toBytes()
	execution.quoteIds = []
	if (deferred) execution.liquidationBlockNumber = event.parameters[6].value.toBigInt()
	execution.save()
}

export function recordLiquidationBatch<T>(_event: ethereum.Event, version: Version): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	let execution = newLiquidationExecution(_event)
	execution.type = "POSITIONS"
	execution.quoteIds = event.params.quoteIds
	// v0.8.5 and the current v0.8.6 overload add averageClosedPrices before the ID.
	if (version >= Version.v_0_8_3) execution.liquidationId = _event.parameters[_event.parameters.length - 1].value.toBytes()
	execution.save()
}

export function recordWithdrawFinalization<T>(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	// The core emits Withdraw immediately before WithdrawFinalized, after provider callbacks.
	let balance = BalanceChange.load(event.transaction.hash.toHexString() + "-" + event.logIndex.minus(BigInt.fromI32(1)).toString())
	if (
		balance &&
		balance.type == "WITHDRAW" &&
		balance.source.equals(event.address) &&
		balance.sender !== null &&
		balance.sender!.equals(event.params.user)
	) {
		let request = WithdrawRequest.load(balance.account.toHexString() + "-" + event.params.requestId.toString() + "-" + event.address.toHexString())
		if (request && request.source.equals(event.address) && request.user.equals(balance.account) && request.amount.equals(balance.amount)) {
			request.finalizedAt = event.block.timestamp
			request.finalizedBlockNumber = event.block.number
			request.finalizedTransaction = event.transaction.hash
			request.finalizedLogIndex = event.logIndex
			request.finalizedBy = event.params.user
			request.finalizedBalanceChange = balance.id
			request.save()
			return
		}
	}
	log.warning("Cannot match withdrawal finalization {} at {}-{} on {}; reindex from contract start", [
		event.params.requestId.toString(),
		event.transaction.hash.toHexString(),
		event.logIndex.toString(),
		event.address.toHexString(),
	])
}
