import { Address, BigInt, Bytes, store } from "@graphprotocol/graph-ts"
import { WithdrawFinalizationHint, WithdrawRequest, WithdrawRequestLookup } from "../../../generated/schema"

export function withdrawRequestId(user: Address, requestId: BigInt, source: Address): string {
	return user.toHexString() + "-" + requestId.toString() + "-" + source.toHexString()
}

function legacyWithdrawRequestId(requestId: BigInt, source: Address): string {
	return requestId.toString() + "-" + source.toHexString()
}

function withdrawRequestLookupId(requestId: BigInt, source: Address): string {
	return requestId.toString() + "-" + source.toHexString()
}

function withdrawFinalizationHintId(source: Address, transaction: Bytes, sender: Address): string {
	return source.toHexString() + "-" + transaction.toHexString() + "-" + sender.toHexString()
}

function addString(ids: Array<string>, id: string): Array<string> {
	let next = ids.slice(0)
	for (let i = 0; i < next.length; i++) {
		if (next[i] == id) return next
	}
	next.push(id)
	return next
}

function removeString(ids: Array<string>, id: string): Array<string> {
	let next: Array<string> = []
	for (let i = 0; i < ids.length; i++) {
		if (ids[i] != id) next.push(ids[i])
	}
	return next
}

function isCompletableWithdrawRequest(wr: WithdrawRequest): boolean {
	return wr.status == "PENDING" || wr.status == "PROVIDER_ACCEPTED" || wr.status == "CANCEL_REQUESTED"
}

export function loadWithdrawRequest(user: Address, requestId: BigInt, source: Address): WithdrawRequest | null {
	let wr = WithdrawRequest.load(withdrawRequestId(user, requestId, source))
	if (wr) return wr
	return WithdrawRequest.load(legacyWithdrawRequestId(requestId, source))
}

export function addWithdrawRequestToLookup(wr: WithdrawRequest): void {
	let source = changetype<Address>(wr.source)
	let id = withdrawRequestLookupId(wr.requestId, source)
	let lookup = WithdrawRequestLookup.load(id)
	if (!lookup) {
		lookup = new WithdrawRequestLookup(id)
		lookup.source = wr.source
		lookup.requestId = wr.requestId
		lookup.activeRequestIds = []
	}
	lookup.activeRequestIds = addString(lookup.activeRequestIds, wr.id)
	lookup.save()
}

export function removeWithdrawRequestFromLookup(wr: WithdrawRequest): void {
	let source = changetype<Address>(wr.source)
	let id = withdrawRequestLookupId(wr.requestId, source)
	let lookup = WithdrawRequestLookup.load(id)
	if (!lookup) return
	lookup.activeRequestIds = removeString(lookup.activeRequestIds, wr.id)
	lookup.save()
}

function loadSingleCompletableWithdrawRequest(requestId: BigInt, source: Address): WithdrawRequest | null {
	let lookup = WithdrawRequestLookup.load(withdrawRequestLookupId(requestId, source))
	if (!lookup) return null
	let matched: WithdrawRequest | null = null
	for (let i = 0; i < lookup.activeRequestIds.length; i++) {
		let wr = WithdrawRequest.load(lookup.activeRequestIds[i])
		if (!wr || !isCompletableWithdrawRequest(wr)) continue
		if (matched !== null) return null
		matched = wr
	}
	return matched
}

export function recordWithdrawFinalizationHint(
	source: Address,
	transaction: Bytes,
	sender: Address,
	user: Address,
	amount: BigInt,
	logIndex: BigInt,
	timestamp: BigInt,
): void {
	let hint = new WithdrawFinalizationHint(withdrawFinalizationHintId(source, transaction, sender))
	hint.source = source
	hint.transaction = transaction
	hint.sender = sender
	hint.user = user
	hint.amount = amount
	hint.logIndex = logIndex
	hint.timestamp = timestamp
	hint.save()
}

export function resolveWithdrawRequest(eventUser: Address, requestId: BigInt, source: Address, transaction: Bytes): WithdrawRequest | null {
	let hintId = withdrawFinalizationHintId(source, transaction, eventUser)
	let hint = WithdrawFinalizationHint.load(hintId)
	if (hint) {
		let hinted = loadWithdrawRequest(changetype<Address>(hint.user), requestId, source)
		store.remove("WithdrawFinalizationHint", hintId)
		if (hinted && isCompletableWithdrawRequest(hinted)) return hinted
	}

	let direct = loadWithdrawRequest(eventUser, requestId, source)
	if (direct && isCompletableWithdrawRequest(direct)) return direct

	return loadSingleCompletableWithdrawRequest(requestId, source)
}
