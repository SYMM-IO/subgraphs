import { BigInt, ethereum, store } from "@graphprotocol/graph-ts"
import { DebugEntity, LiquidationDetail, Quote, QuoteFeeHint, WithdrawRequest } from "../../../generated/schema"
import { Version } from "../../common/BaseHandler"
import { JSONBuilder } from "./quoteEvent"

export function consumeQuoteFeeHint(quote: Quote): void {
	let hint = QuoteFeeHint.load(quote.id)
	if (!hint || !hint.source.equals(quote.source) || !hint.partyA.equals(quote.partyA)) return
	if (hint.paidOpenFee !== null) quote.paidOpenFee = (quote.paidOpenFee === null ? BigInt.zero() : quote.paidOpenFee!).plus(hint.paidOpenFee!)
	if (hint.paidCloseFee !== null) quote.paidCloseFee = (quote.paidCloseFee === null ? BigInt.zero() : quote.paidCloseFee!).plus(hint.paidCloseFee!)
	quote.paidFeeAffiliate = hint.affiliate
	quote.paidFeesTimestamp = hint.timestamp
	quote.paidFeesBlockNumber = hint.blockNumber
	quote.save()
	store.remove("QuoteFeeHint", quote.id)
}

export function accumulateQuoteFees<T>(_event: ethereum.Event): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	let id = event.params.quoteId.toString() + "-" + event.address.toHexString()
	let quote = Quote.load(id)
	if (quote && quote.source.equals(event.address) && quote.partyA.equals(event.params.partyA)) {
		consumeQuoteFeeHint(quote)
		if (event.params._type == 0) quote.paidOpenFee = (quote.paidOpenFee === null ? BigInt.zero() : quote.paidOpenFee!).plus(event.params.amount)
		else quote.paidCloseFee = (quote.paidCloseFee === null ? BigInt.zero() : quote.paidCloseFee!).plus(event.params.amount)
		quote.paidFeeAffiliate = event.params.affiliate
		quote.paidFeesTimestamp = event.block.timestamp
		quote.paidFeesBlockNumber = event.block.number
		quote.save()
		return
	}
	// Retain charges without inventing the missing quote's required lifecycle fields.
	let row = QuoteFeeHint.load(id)
	if (!row) row = new QuoteFeeHint(id)
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
	// Missing initiation or conflicting evidence is an indexing gap, not a second
	// withdrawal model. Keep exact evidence for repair/reindex without guessing an owner.
	let debug = new DebugEntity("WithdrawFinalized-unresolved-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
	debug.message = new JSONBuilder()
		.add("source", event.address.toHexString())
		.add("requestId", event.params.requestId.toString())
		.add("signer", event.params.user.toHexString())
		.add("transaction", event.transaction.hash.toHexString())
		.add("logIndex", event.logIndex.toString())
		.add("blockNumber", event.block.number.toString())
		.add("timestamp", event.block.timestamp.toString())
		.build()
	debug.save()
}

export function recordLiquidationStart(event: ethereum.Event, deferred: boolean, version: Version): void {
	// COTI's core versions emit the lifecycle ID. Leave legacy state-based linkage unchanged.
	if (version < Version.v_0_8_3) return
	let partyA = event.parameters[1].value.toAddress()
	let liquidationId = event.parameters[5].value.toBytes()
	let detail = LiquidationDetail.load(partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString())
	if (!detail) return
	detail.startTimestamp = event.block.timestamp
	detail.startBlockNumber = event.block.number
	detail.startLogIndex = event.logIndex
	detail.deferred = deferred
	if (deferred) detail.liquidationBlockNumber = event.parameters[6].value.toBigInt()
	detail.save()
}
