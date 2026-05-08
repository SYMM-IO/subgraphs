import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { PendingQuoteIndex, Quote } from "../../../generated/schema"
import { unDecimal } from "../utils"
import { QuoteStatus } from "../../analytics/utils/constants"

function quoteEntityId(quoteId: BigInt, source: Address): string {
	return quoteId.toString() + "-" + source.toHexString()
}

function partyAPendingIndexId(partyA: Address, source: Address): string {
	return source.toHexString() + "-" + partyA.toHexString()
}

function partyBPendingIndexId(partyA: Address, partyB: Address, source: Address): string {
	return source.toHexString() + "-" + partyA.toHexString() + "-" + partyB.toHexString()
}

function addQuoteId(ids: Array<BigInt> | null, quoteId: BigInt): Array<BigInt> {
	let next: Array<BigInt> = []
	if (ids !== null) next = ids.slice(0)
	for (let i = 0; i < next.length; i++) {
		if (next[i].equals(quoteId)) return next
	}
	next.push(quoteId)
	return next
}

function removeQuoteId(ids: Array<BigInt>, quoteId: BigInt): Array<BigInt> {
	let next: Array<BigInt> = []
	for (let i = 0; i < ids.length; i++) {
		if (!ids[i].equals(quoteId)) next.push(ids[i])
	}
	return next
}

function loadOrCreatePendingIndex(id: string, partyA: Address, partyB: Address | null, source: Address): PendingQuoteIndex {
	let index = PendingQuoteIndex.load(id)
	if (!index) {
		index = new PendingQuoteIndex(id)
		index.source = source
		index.partyA = partyA
		index.partyB = partyB
		index.quoteIds = []
	}
	return index
}

function addQuoteToPendingIndex(id: string, quote: Quote, partyB: Address | null): void {
	let index = loadOrCreatePendingIndex(id, changetype<Address>(quote.partyA), partyB, changetype<Address>(quote.source))
	index.quoteIds = addQuoteId(index.quoteIds, quote.quoteId)
	index.save()
}

export function isPendingLikeQuoteStatus(status: i32): boolean {
	return status == QuoteStatus.PENDING || status == QuoteStatus.LOCKED || status == QuoteStatus.CANCEL_PENDING
}

export function addQuoteToPendingList(quote: Quote): void {
	addQuoteToPendingIndex(partyAPendingIndexId(changetype<Address>(quote.partyA), changetype<Address>(quote.source)), quote, null)
	if (quote.partyB) {
		addQuoteToPendingIndex(
			partyBPendingIndexId(changetype<Address>(quote.partyA), changetype<Address>(quote.partyB!), changetype<Address>(quote.source)),
			quote,
			changetype<Address>(quote.partyB!),
		)
	}
}

function removeQuoteFromIndex(id: string, quoteId: BigInt): void {
	let index = PendingQuoteIndex.load(id)
	if (!index) return
	index.quoteIds = removeQuoteId(index.quoteIds, quoteId)
	index.save()
}

export function removeQuoteFromPendingList(quoteId: BigInt, source: Address): void {
	let quote = Quote.load(quoteEntityId(quoteId, source))
	if (quote) {
		removeQuoteFromIndex(partyAPendingIndexId(changetype<Address>(quote.partyA), source), quoteId)
		if (quote.partyB)
			removeQuoteFromIndex(partyBPendingIndexId(changetype<Address>(quote.partyA), changetype<Address>(quote.partyB!), source), quoteId)
	}
}

function collectLiquidatableQuoteIdsFromIndex(id: string, source: Address): Array<BigInt> {
	let index = PendingQuoteIndex.load(id)
	if (!index) return []
	let quoteIds: Array<BigInt> = []
	let retained: Array<BigInt> = []
	let dirty = false
	for (let i = 0; i < index.quoteIds.length; i++) {
		let quoteId = index.quoteIds[i]
		let quote = Quote.load(quoteEntityId(quoteId, source))
		if (quote && isPendingLikeQuoteStatus(quote.quoteStatus)) {
			quoteIds.push(quoteId)
			retained.push(quoteId)
		} else {
			dirty = true
		}
	}
	if (dirty) {
		index.quoteIds = retained
		index.save()
	}
	return quoteIds
}

export function getLiquidatablePendingQuoteIds(subject: Address, counterparties: Array<Address>, source: Address): Array<BigInt> {
	let quoteIds: Array<BigInt> = []
	if (counterparties.length == 0) {
		return collectLiquidatableQuoteIdsFromIndex(partyAPendingIndexId(subject, source), source)
	}

	for (let i = 0; i < counterparties.length; i++) {
		let ids = collectLiquidatableQuoteIdsFromIndex(partyBPendingIndexId(counterparties[i], subject, source), source)
		for (let j = 0; j < ids.length; j++) {
			let exists = false
			for (let k = 0; k < quoteIds.length; k++) {
				if (quoteIds[k].equals(ids[j])) {
					exists = true
					break
				}
			}
			if (!exists) quoteIds.push(ids[j])
		}
	}
	return quoteIds
}

export function setEventTimestampAndTransactionHashAndAction(quote: Quote, eventName: string, _event: ethereum.Event): void {
	quote.action = eventName
	quote.timestamp = _event.block.timestamp
	quote.blockNumber = _event.block.number
	// 7 = CLOSED, 8 = LIQUIDATED
	if (!quote.timestampFullyClose && (quote.quoteStatus == 7 || quote.quoteStatus == 8)) {
		quote.timestampFullyClose = _event.block.timestamp
	}
	quote.save()
	if (!isPendingLikeQuoteStatus(quote.quoteStatus)) removeQuoteFromPendingList(quote.quoteId, _event.address)
}

export function applyFundingTotalsFromAccumulatedFundingChange(quote: Quote, newAccumulatedPaidFunding: BigInt, openAmount: BigInt): void {
	let previousAccumulatedPaidFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero()
	let delta = newAccumulatedPaidFunding.minus(previousAccumulatedPaidFunding)
	if (delta.isZero()) return

	let fundingAmount = unDecimal(delta.abs().times(openAmount))
	if (delta.gt(BigInt.zero())) {
		quote.userPaidFunding = (quote.userPaidFunding ? quote.userPaidFunding! : BigInt.zero()).plus(fundingAmount)
	} else {
		quote.userReceivedFunding = (quote.userReceivedFunding ? quote.userReceivedFunding! : BigInt.zero()).plus(fundingAmount)
	}
}
