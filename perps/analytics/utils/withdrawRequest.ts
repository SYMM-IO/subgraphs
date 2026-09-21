import { Address, BigInt, Bytes, store } from "@graphprotocol/graph-ts"
import {
	BalanceChange,
	WithdrawCoreLifecycleHint,
	WithdrawRequest,
	WithdrawRequestAccountLookup,
	WithdrawRequestLookup,
} from "../../../generated/schema"

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

function withdrawCoreLifecycleHintId(source: Address, user: Address, requestId: BigInt, transaction: Bytes): string {
	return source.toHexString() + "-" + user.toHexString() + "-" + requestId.toString() + "-" + transaction.toHexString()
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
	return isActiveWithdrawRequest(wr)
}

// Requests still counted in pending amounts/active counts. Terminal handlers must only
// decrement when transitioning out of one of these states, or a duplicated terminal
// event would double-decrement the aggregates.
export function isActiveWithdrawRequest(wr: WithdrawRequest): boolean {
	return wr.status == "PENDING" || wr.status == "PROVIDER_ACCEPTED" || wr.status == "CANCEL_REQUESTED"
}

export function loadWithdrawRequest(user: Address, requestId: BigInt, source: Address): WithdrawRequest | null {
	let wr = WithdrawRequest.load(withdrawRequestId(user, requestId, source))
	if (wr) return wr
	return WithdrawRequest.load(legacyWithdrawRequestId(requestId, source))
}

function loadOrCreateWithdrawCoreLifecycleHint(
	source: Address,
	user: Address,
	requestId: BigInt,
	transaction: Bytes,
	timestamp: BigInt,
	blockNumber: BigInt,
): WithdrawCoreLifecycleHint {
	let id = withdrawCoreLifecycleHintId(source, user, requestId, transaction)
	let hint = WithdrawCoreLifecycleHint.load(id)
	if (!hint) {
		hint = new WithdrawCoreLifecycleHint(id)
		hint.source = source
		hint.user = user
		hint.requestId = requestId
		hint.transaction = transaction
		hint.advancedAmount = BigInt.zero()
	}
	hint.updateTimestamp = timestamp
	hint.blockNumber = blockNumber
	return hint
}

export function recordWithdrawCoreStatusHint(
	source: Address,
	user: Address,
	requestId: BigInt,
	status: string,
	transaction: Bytes,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let hint = loadOrCreateWithdrawCoreLifecycleHint(source, user, requestId, transaction, timestamp, blockNumber)
	hint.status = status
	hint.save()
}

export function recordWithdrawCoreAdvanceHint(
	source: Address,
	user: Address,
	requestId: BigInt,
	amount: BigInt,
	transaction: Bytes,
	timestamp: BigInt,
	blockNumber: BigInt,
): void {
	let hint = loadOrCreateWithdrawCoreLifecycleHint(source, user, requestId, transaction, timestamp, blockNumber)
	hint.advancedAmount = hint.advancedAmount.plus(amount)
	hint.save()
}

export function consumeWithdrawCoreLifecycleHint(request: WithdrawRequest, transaction: Bytes): BigInt {
	let source = changetype<Address>(request.source)
	let user = changetype<Address>(request.user)
	let id = withdrawCoreLifecycleHintId(source, user, request.requestId, transaction)
	let hint = WithdrawCoreLifecycleHint.load(id)
	if (!hint) return BigInt.zero()
	if (
		hint.source.toHexString() != request.source.toHexString() ||
		hint.user.toHexString() != request.user.toHexString() ||
		!hint.requestId.equals(request.requestId) ||
		hint.transaction.toHexString() != transaction.toHexString()
	) {
		return BigInt.zero()
	}
	if (hint.status !== null) request.status = hint.status!
	request.advancedAmount = request.advancedAmount.plus(hint.advancedAmount)
	request.updateTimestamp = hint.updateTimestamp
	request.blockNumber = hint.blockNumber
	request.save()
	store.remove("WithdrawCoreLifecycleHint", id)
	return hint.advancedAmount
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

export function resolveWithdrawRequest(eventUser: Address, requestId: BigInt, source: Address, transaction: Bytes, logIndex: BigInt): WithdrawRequest | null {
	// The core emits Withdraw immediately before WithdrawFinalized. Match that
	// exact log, including for provider/multicall transactions. The finalizing
	// signer and a globally unique-looking request number do not prove ownership.
	let balance = BalanceChange.load(transaction.toHexString() + "-" + logIndex.minus(BigInt.fromI32(1)).toString())
	if (!balance || balance.type != "WITHDRAW" || !balance.source.equals(source) || balance.sender === null || !balance.sender!.equals(eventUser)) return null
	let request = loadWithdrawRequest(changetype<Address>(balance.account), requestId, source)
	if (!request || !isCompletableWithdrawRequest(request) || !request.user.equals(balance.account) || !request.source.equals(source) || !request.amount.equals(balance.amount)) return null
	return request
}
