import { Address, BigInt, Bytes, store } from "@graphprotocol/graph-ts"
import { WithdrawFinalizationHint, WithdrawRequest, WithdrawRequestAccountLookup, WithdrawRequestLookup } from "../../../generated/schema"

const FINALIZE_WITHDRAW_REQUEST_SELECTOR = "0x1531b3c8"

export function withdrawRequestId(user: Address, requestId: BigInt, source: Address): string {
	return user.toHexString() + "-" + requestId.toString() + "-" + source.toHexString()
}

function legacyWithdrawRequestId(requestId: BigInt, source: Address): string {
	return requestId.toString() + "-" + source.toHexString()
}

function withdrawRequestLookupId(requestId: BigInt, source: Address): string {
	return requestId.toString() + "-" + source.toHexString()
}

function withdrawRequestAccountLookupId(account: Bytes, source: Bytes): string {
	return account.toHexString() + "-" + source.toHexString()
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

export function isFinalizeWithdrawRequestCall(input: Bytes): boolean {
	return input.toHexString().startsWith(FINALIZE_WITHDRAW_REQUEST_SELECTOR)
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

	let accountLookupId = withdrawRequestAccountLookupId(wr.user, wr.source)
	let accountLookup = WithdrawRequestAccountLookup.load(accountLookupId)
	if (!accountLookup) {
		accountLookup = new WithdrawRequestAccountLookup(accountLookupId)
		accountLookup.source = wr.source
		accountLookup.account = wr.user
		accountLookup.activeRequestIds = []
	}
	accountLookup.activeRequestIds = addString(accountLookup.activeRequestIds, wr.id)
	accountLookup.save()
}

export function removeWithdrawRequestFromLookup(wr: WithdrawRequest): void {
	let accountLookupId = withdrawRequestAccountLookupId(wr.user, wr.source)
	let accountLookup = WithdrawRequestAccountLookup.load(accountLookupId)
	if (accountLookup) {
		accountLookup.activeRequestIds = removeString(accountLookup.activeRequestIds, wr.id)
		if (accountLookup.activeRequestIds.length == 0) {
			store.remove("WithdrawRequestAccountLookup", accountLookupId)
		} else {
			accountLookup.save()
		}
	}

	let source = changetype<Address>(wr.source)
	let id = withdrawRequestLookupId(wr.requestId, source)
	let lookup = WithdrawRequestLookup.load(id)
	if (!lookup) return
	lookup.activeRequestIds = removeString(lookup.activeRequestIds, wr.id)
	if (lookup.activeRequestIds.length == 0) {
		store.remove("WithdrawRequestLookup", id)
		return
	}
	lookup.save()
}

export function loadWithdrawRequestAccountLookup(account: Bytes, source: Bytes): WithdrawRequestAccountLookup | null {
	return WithdrawRequestAccountLookup.load(withdrawRequestAccountLookupId(account, source))
}

function loadSingleCompletableWithdrawRequest(requestId: BigInt, source: Address): WithdrawRequest | null {
	let lookup = WithdrawRequestLookup.load(withdrawRequestLookupId(requestId, source))
	if (!lookup) return null
	if (lookup.activeRequestIds.length == 0) {
		store.remove("WithdrawRequestLookup", lookup.id)
		return null
	}
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
