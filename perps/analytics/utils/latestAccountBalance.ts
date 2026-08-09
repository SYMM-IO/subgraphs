import { Address, BigInt, ethereum, log, store } from "@graphprotocol/graph-ts"
import { Version } from "../../common/BaseHandler"
import {
	LatestAccountBalance,
	LatestAccountBalanceRegistryNode,
	LatestAccountBalanceRemovalGuard,
	LatestAccountBalanceSweepMeta,
} from "../../../generated/schema"
import {
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_0,
	getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_0,
	getBalanceOf as getBalanceOf_0_8_0,
} from "../../common/contract_utils_0_8_0"
import {
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_1,
	getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_1,
	getBalanceOf as getBalanceOf_0_8_1,
} from "../../common/contract_utils_0_8_1"
import {
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_2,
	getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_2,
	getBalanceOf as getBalanceOf_0_8_2,
} from "../../common/contract_utils_0_8_2"
import {
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_3,
	getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_3,
	getBalanceOf as getBalanceOf_0_8_3,
} from "../../common/contract_utils_0_8_3"
import {
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_4,
	getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_4,
	getBalanceOf as getBalanceOf_0_8_4,
} from "../../common/contract_utils_0_8_4"
import {
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_5,
	getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_5,
	getBalanceOf as getBalanceOf_0_8_5,
	isCrossPartyB as isCrossPartyB_0_8_5,
} from "../../common/contract_utils_0_8_5"
import {
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_6,
	getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_6,
	getBalanceOf as getBalanceOf_0_8_6,
	isCrossPartyB as isCrossPartyB_0_8_6,
} from "../../common/contract_utils_0_8_6"
import { clearAffiliateExpressWithdrawBalanceSnapshot, syncAffiliateExpressWithdrawBalanceSnapshot } from "./affiliateExpressWithdrawComponents"

function getBalanceOf(version: Version, source: Address, account: Address): BigInt | null {
	if (version == Version.v_0_8_6) return getBalanceOf_0_8_6(source, account)
	if (version == Version.v_0_8_5) return getBalanceOf_0_8_5(source, account)
	if (version == Version.v_0_8_4) return getBalanceOf_0_8_4(source, account)
	if (version == Version.v_0_8_3) return getBalanceOf_0_8_3(source, account)
	if (version == Version.v_0_8_2) return getBalanceOf_0_8_2(source, account)
	if (version == Version.v_0_8_1) return getBalanceOf_0_8_1(source, account)
	return getBalanceOf_0_8_0(source, account)
}

function finalizeBalance(entity: LatestAccountBalance, event: ethereum.Event, version: Version, source: Address, account: Address): boolean {
	let free = getBalanceOf(version, source, account)
	if (free === null) {
		log.warning("Failed to get free balance of account {}", [account.toHexString()])
		return false
	}
	entity.freeBalance = free
	entity.totalBalance = entity.freeBalance
		.plus(entity.allocatedBalance)
		.plus(entity.lockedCva)
		.plus(entity.lockedLf)
		.plus(entity.lockedPartyAmm)
		.plus(entity.lockedPartyBmm)
		.plus(entity.pendingLockedCva)
		.plus(entity.pendingLockedLf)
		.plus(entity.pendingLockedPartyAmm)
		.plus(entity.pendingLockedPartyBmm)
	return true
}

function finalizeBalanceAtBlock(entity: LatestAccountBalance, block: ethereum.Block, version: Version, source: Address, account: Address): boolean {
	let free = getBalanceOf(version, source, account)
	if (free === null) {
		log.warning("Failed to get free balance of account {} at block {}", [account.toHexString(), block.number.toString()])
		return false
	}
	entity.freeBalance = free
	entity.totalBalance = entity.freeBalance
		.plus(entity.allocatedBalance)
		.plus(entity.lockedCva)
		.plus(entity.lockedLf)
		.plus(entity.lockedPartyAmm)
		.plus(entity.lockedPartyBmm)
		.plus(entity.pendingLockedCva)
		.plus(entity.pendingLockedLf)
		.plus(entity.pendingLockedPartyAmm)
		.plus(entity.pendingLockedPartyBmm)
	return true
}

function isPartyALatestBalanceEmpty(entity: LatestAccountBalance): boolean {
	return (
		entity.freeBalance.isZero() &&
		entity.allocatedBalance.isZero() &&
		entity.lockedCva.isZero() &&
		entity.lockedLf.isZero() &&
		entity.lockedPartyAmm.isZero() &&
		entity.lockedPartyBmm.isZero() &&
		entity.pendingLockedCva.isZero() &&
		entity.pendingLockedLf.isZero() &&
		entity.pendingLockedPartyAmm.isZero() &&
		entity.pendingLockedPartyBmm.isZero()
	)
}

function isPartyBLatestBalanceBucketEmpty(entity: LatestAccountBalance): boolean {
	return (
		entity.allocatedBalance.isZero() &&
		entity.lockedCva.isZero() &&
		entity.lockedLf.isZero() &&
		entity.lockedPartyAmm.isZero() &&
		entity.lockedPartyBmm.isZero() &&
		entity.pendingLockedCva.isZero() &&
		entity.pendingLockedLf.isZero() &&
		entity.pendingLockedPartyAmm.isZero() &&
		entity.pendingLockedPartyBmm.isZero()
	)
}

function resolvePartyBBalanceKey(event: ethereum.Event, version: Version, partyB: Address, partyA: Address): Address {
	if (partyA.equals(Address.zero())) return partyA
	if (version == Version.v_0_8_6) {
		let isCross = isCrossPartyB_0_8_6(event.address, partyB)
		return isCross ? Address.zero() : partyA
	}
	if (version == Version.v_0_8_5) {
		let isCross = isCrossPartyB_0_8_5(event.address, partyB)
		return isCross ? Address.zero() : partyA
	}
	return partyA
}

// Sweep pacing: walk the registry at most every SWEEP_PERIOD_SECONDS, re-verify rows whose
// last chain-state write or verification is older than VERIFY_MIN_AGE_SECONDS, and cap the
// eth_call work per pass so a single block handler invocation stays bounded.
const SWEEP_PERIOD_SECONDS: i32 = 1200
const VERIFY_MIN_AGE_SECONDS: i32 = 86400
const MAX_VERIFICATIONS_PER_SWEEP: i32 = 100

function sweepMetaId(source: Address): string {
	return source.toHexString()
}

function loadOrCreateSweepMeta(source: Address): LatestAccountBalanceSweepMeta {
	let meta = LatestAccountBalanceSweepMeta.load(sweepMetaId(source))
	if (meta == null) {
		meta = new LatestAccountBalanceSweepMeta(sweepMetaId(source))
		meta.head = null
		meta.tail = null
		meta.lastSweepTimestamp = BigInt.zero()
	}
	return meta
}

function unlinkLatestBalanceRegistryNode(node: LatestAccountBalanceRegistryNode, source: Address): void {
	let prev = node.prev
	let next = node.next
	let meta = loadOrCreateSweepMeta(source)
	if (prev != null) {
		let prevNode = LatestAccountBalanceRegistryNode.load(prev!)
		if (prevNode != null) {
			prevNode.next = next
			prevNode.save()
		}
	}
	if (next != null) {
		let nextNode = LatestAccountBalanceRegistryNode.load(next!)
		if (nextNode != null) {
			nextNode.prev = prev
			nextNode.save()
		}
	}
	if (meta.head == node.id) meta.head = next
	if (meta.tail == node.id) meta.tail = prev
	meta.save()
	node.prev = null
	node.next = null
}

// The registry list is kept in most-recently-verified-first order, so the sweep can start at
// the tail and stop at the first fresh node instead of walking every live row.
function touchLatestBalanceRegistryNode(id: string, source: Address, timestamp: BigInt): void {
	let node = LatestAccountBalanceRegistryNode.load(id)
	if (node == null) {
		node = new LatestAccountBalanceRegistryNode(id)
		node.source = source
		node.prev = null
		node.next = null
	} else {
		if (node.prev == null) {
			let metaCheck = loadOrCreateSweepMeta(source)
			if (metaCheck.head == id) {
				// Already at the head; just refresh the stamp without relinking.
				if (node.lastVerifiedTimestamp.lt(timestamp)) {
					node.lastVerifiedTimestamp = timestamp
					node.save()
				}
				return
			}
		}
		unlinkLatestBalanceRegistryNode(node, source)
	}
	node.lastVerifiedTimestamp = timestamp
	let meta = loadOrCreateSweepMeta(source)
	let head = meta.head
	node.next = head
	if (head != null) {
		let headNode = LatestAccountBalanceRegistryNode.load(head!)
		if (headNode != null) {
			headNode.prev = id
			headNode.save()
		}
	}
	meta.head = id
	if (meta.tail == null) meta.tail = id
	meta.save()
	node.save()
}

function removeLatestAccountBalanceRow(id: string, source: Address): void {
	let node = LatestAccountBalanceRegistryNode.load(id)
	if (node != null) {
		unlinkLatestBalanceRegistryNode(node, source)
		store.remove("LatestAccountBalanceRegistryNode", id)
	}
	store.remove("LatestAccountBalance", id)
}

function markLatestBalanceRemoval(id: string, event: ethereum.Event): void {
	let guard = LatestAccountBalanceRemovalGuard.load(id)
	if (guard == null) guard = new LatestAccountBalanceRemovalGuard(id)
	guard.blockNumber = event.block.number
	guard.transaction = event.transaction.hash
	guard.logIndex = event.logIndex
	guard.save()
}

function shouldSkipStaleLatestBalanceWrite(id: string, event: ethereum.Event): boolean {
	let guard = LatestAccountBalanceRemovalGuard.load(id)
	if (guard == null) return false
	if (!guard.blockNumber.equals(event.block.number)) return false
	if (!guard.transaction.equals(event.transaction.hash)) return false
	return guard.logIndex.gt(event.logIndex) || guard.logIndex.equals(event.logIndex)
}

function applyPartyABalanceInfo(entity: LatestAccountBalance, version: Version, source: Address, partyA: Address): boolean {
	if (version == Version.v_0_8_6) {
		let info = getBalanceInfoOfPartyA_0_8_6(source, partyA)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_5) {
		let info = getBalanceInfoOfPartyA_0_8_5(source, partyA)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_4) {
		let info = getBalanceInfoOfPartyA_0_8_4(source, partyA)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_3) {
		let info = getBalanceInfoOfPartyA_0_8_3(source, partyA)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_2) {
		let info = getBalanceInfoOfPartyA_0_8_2(source, partyA)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_1) {
		let info = getBalanceInfoOfPartyA_0_8_1(source, partyA)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	// v0.8.0 predates the mm -> partyAmm/partyBmm split; the 9 values are
	// (allocated, cva, mm, lf, total, pendingCva, pendingMm, pendingLf, pendingTotal).
	// Map mm to partyAmm, zero partyBmm, and skip the totals so sums don't double count.
	let info = getBalanceInfoOfPartyA_0_8_0(source, partyA)
	if (!info) return false
	entity.allocatedBalance = info.value0
	entity.lockedCva = info.value1
	entity.lockedPartyAmm = info.value2
	entity.lockedLf = info.value3
	entity.lockedPartyBmm = BigInt.zero()
	entity.pendingLockedCva = info.value5
	entity.pendingLockedPartyAmm = info.value6
	entity.pendingLockedLf = info.value7
	entity.pendingLockedPartyBmm = BigInt.zero()
	return true
}

function applyPartyBBalanceInfo(entity: LatestAccountBalance, version: Version, source: Address, partyB: Address, balanceKey: Address): boolean {
	if (version == Version.v_0_8_6) {
		let info = getBalanceInfoOfPartyB_0_8_6(source, balanceKey, partyB)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_5) {
		let info = getBalanceInfoOfPartyB_0_8_5(source, balanceKey, partyB)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_4) {
		let info = getBalanceInfoOfPartyB_0_8_4(source, balanceKey, partyB)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_3) {
		let info = getBalanceInfoOfPartyB_0_8_3(source, balanceKey, partyB)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_2) {
		let info = getBalanceInfoOfPartyB_0_8_2(source, balanceKey, partyB)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	if (version == Version.v_0_8_1) {
		let info = getBalanceInfoOfPartyB_0_8_1(source, balanceKey, partyB)
		if (!info) return false
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
		return true
	}
	// v0.8.0 pre-split layout: (allocated, cva, mm, lf, total, pendingCva, pendingMm, pendingLf, pendingTotal).
	let info = getBalanceInfoOfPartyB_0_8_0(source, balanceKey, partyB)
	if (!info) return false
	entity.allocatedBalance = info.value0
	entity.lockedCva = info.value1
	entity.lockedPartyBmm = info.value2
	entity.lockedLf = info.value3
	entity.lockedPartyAmm = BigInt.zero()
	entity.pendingLockedCva = info.value5
	entity.pendingLockedPartyBmm = info.value6
	entity.pendingLockedLf = info.value7
	entity.pendingLockedPartyAmm = BigInt.zero()
	return true
}

// Periodic reconciliation pass. Event-driven updates go stale permanently when the indexer's
// trigger stream drops a block range (observed on HyperEVM: the deallocate that emptied a
// bucket was never delivered, leaving its LatestAccountBalance row frozen). The sweep walks
// the registry from the least-recently-verified tail, re-reads aged rows from chain state,
// removes buckets that emptied unseen, and refreshes values that drifted.
export function sweepLatestAccountBalances(block: ethereum.Block, source: Address, sourceVersion: Version): void {
	let meta = LatestAccountBalanceSweepMeta.load(sweepMetaId(source))
	if (meta == null) return
	if (block.timestamp.minus(meta.lastSweepTimestamp).lt(BigInt.fromI32(SWEEP_PERIOD_SECONDS))) return
	meta.lastSweepTimestamp = block.timestamp
	meta.save()

	let verifications: i32 = 0
	let cursor = meta.tail
	while (cursor != null && verifications < MAX_VERIFICATIONS_PER_SWEEP) {
		let id = cursor!
		let node = LatestAccountBalanceRegistryNode.load(id)
		if (node == null) break
		// Tail-first order means the first fresh node ends the eligible segment.
		if (block.timestamp.minus(node.lastVerifiedTimestamp).lt(BigInt.fromI32(VERIFY_MIN_AGE_SECONDS))) break
		cursor = node.prev

		let entity = LatestAccountBalance.load(id)
		if (entity == null) {
			unlinkLatestBalanceRegistryNode(node, source)
			store.remove("LatestAccountBalanceRegistryNode", id)
			continue
		}

		let account = changetype<Address>(entity.account)
		let prevAllocated = entity.allocatedBalance
		let prevCva = entity.lockedCva
		let prevLf = entity.lockedLf
		let prevAmm = entity.lockedPartyAmm
		let prevBmm = entity.lockedPartyBmm
		let prevPendingCva = entity.pendingLockedCva
		let prevPendingLf = entity.pendingLockedLf
		let prevPendingAmm = entity.pendingLockedPartyAmm
		let prevPendingBmm = entity.pendingLockedPartyBmm
		let prevFree = entity.freeBalance
		let prevTotal = entity.totalBalance

		let applied = false
		if (entity.accountType == "PARTY_A") {
			verifications++
			applied = applyPartyABalanceInfo(entity, sourceVersion, source, account)
		} else {
			let counterParty = entity.counterParty
			if (counterParty === null) {
				// A PARTY_B row without a balance key cannot be re-verified; re-stamp it so it
				// stops occupying the stale end of the registry.
				touchLatestBalanceRegistryNode(id, source, block.timestamp)
				continue
			}
			verifications++
			applied = applyPartyBBalanceInfo(entity, sourceVersion, source, account, changetype<Address>(counterParty))
		}
		// Back off a failed row by moving it to the fresh end of the registry. Leaving
		// permanent failures at the tail lets the same MAX_VERIFICATIONS_PER_SWEEP rows
		// consume every pass and starves all healthy rows behind them.
		if (!applied) {
			touchLatestBalanceRegistryNode(id, source, block.timestamp)
			continue
		}
		if (!finalizeBalanceAtBlock(entity, block, sourceVersion, source, account)) {
			touchLatestBalanceRegistryNode(id, source, block.timestamp)
			continue
		}

		if (entity.accountType == "PARTY_A" ? isPartyALatestBalanceEmpty(entity) : isPartyBLatestBalanceBucketEmpty(entity)) {
			if (entity.accountType == "PARTY_A") {
				clearAffiliateExpressWithdrawBalanceSnapshot(account, source, block.timestamp, block.number)
			}
			removeLatestAccountBalanceRow(id, source)
			continue
		}

		let changed =
			!entity.allocatedBalance.equals(prevAllocated) ||
			!entity.lockedCva.equals(prevCva) ||
			!entity.lockedLf.equals(prevLf) ||
			!entity.lockedPartyAmm.equals(prevAmm) ||
			!entity.lockedPartyBmm.equals(prevBmm) ||
			!entity.pendingLockedCva.equals(prevPendingCva) ||
			!entity.pendingLockedLf.equals(prevPendingLf) ||
			!entity.pendingLockedPartyAmm.equals(prevPendingAmm) ||
			!entity.pendingLockedPartyBmm.equals(prevPendingBmm) ||
			!entity.freeBalance.equals(prevFree) ||
			!entity.totalBalance.equals(prevTotal)
		if (changed) {
			// The transaction hash is left as the last event-derived value: the write that
			// actually changed this balance was never delivered to the subgraph.
			entity.timestamp = block.timestamp
			entity.blockNumber = block.number
			entity.save()
			if (entity.accountType == "PARTY_A") {
				syncAffiliateExpressWithdrawBalanceSnapshot(entity, block.timestamp, block.number)
			}
		}
		touchLatestBalanceRegistryNode(id, source, block.timestamp)
	}
}

export function updatePartyALatestBalance(event: ethereum.Event, version: Version, partyA: Address): void {
	updatePartyALatestBalanceForSource(event, version, event.address, partyA)
}

export function updatePartyALatestBalanceForSource(event: ethereum.Event, version: Version, source: Address, partyA: Address): void {
	let id = partyA.toHexString() + "-" + source.toHexString()
	let isNew = false
	let entity = LatestAccountBalance.load(id)
	if (!entity) {
		isNew = true
		entity = new LatestAccountBalance(id)
		entity.source = source
		entity.account = partyA
		entity.accountRef = partyA.toHexString()
		entity.counterParty = null
		entity.counterPartyRef = null
		entity.accountType = "PARTY_A"
	}

	if (!applyPartyABalanceInfo(entity, version, source, partyA)) {
		log.warning("Failed to get balance info of partyA {}", [partyA.toHexString()])
		return
	}

	if (!finalizeBalance(entity, event, version, source, partyA)) return

	if (isPartyALatestBalanceEmpty(entity)) {
		clearAffiliateExpressWithdrawBalanceSnapshot(partyA, source, event.block.timestamp, event.block.number)
		markLatestBalanceRemoval(id, event)
		if (!isNew) removeLatestAccountBalanceRow(id, source)
		return
	}

	if (shouldSkipStaleLatestBalanceWrite(id, event)) return
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
	touchLatestBalanceRegistryNode(id, source, event.block.timestamp)
	syncAffiliateExpressWithdrawBalanceSnapshot(entity, event.block.timestamp, event.block.number)
}

export function updatePartyBLatestBalance(event: ethereum.Event, version: Version, partyB: Address, partyA: Address): void {
	let balanceKey = resolvePartyBBalanceKey(event, version, partyB, partyA)
	if (!balanceKey.equals(partyA)) {
		let staleId = partyB.toHexString() + "-" + partyA.toHexString() + "-" + event.address.toHexString()
		markLatestBalanceRemoval(staleId, event)
		removeLatestAccountBalanceRow(staleId, event.address)
	}

	let id = partyB.toHexString() + "-" + balanceKey.toHexString() + "-" + event.address.toHexString()
	let isNew = false
	let entity = LatestAccountBalance.load(id)
	if (!entity) {
		isNew = true
		entity = new LatestAccountBalance(id)
		entity.source = event.address
		entity.account = partyB
		entity.accountRef = partyB.toHexString()
		entity.counterParty = balanceKey
		entity.counterPartyRef = balanceKey.toHexString()
		entity.accountType = "PARTY_B"
	}

	if (!applyPartyBBalanceInfo(entity, version, event.address, partyB, balanceKey)) {
		log.warning("Failed to get balance info of partyB {}", [partyB.toHexString()])
		return
	}

	if (!finalizeBalance(entity, event, version, event.address, partyB)) return

	if (isPartyBLatestBalanceBucketEmpty(entity)) {
		markLatestBalanceRemoval(id, event)
		if (!isNew) removeLatestAccountBalanceRow(id, event.address)
		return
	}

	if (shouldSkipStaleLatestBalanceWrite(id, event)) return
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
	touchLatestBalanceRegistryNode(id, event.address, event.block.timestamp)
}
