import { Address, BigInt, ethereum, log, store } from "@graphprotocol/graph-ts"
import { Version } from "../../common/BaseHandler"
import { LatestAccountBalance } from "../../../generated/schema"
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

	if (version == Version.v_0_8_6) {
		let info = getBalanceInfoOfPartyA_0_8_6(source, partyA)
		if (!info) {
			log.warning("Failed to get balance info of partyA {} for version 0.8.6", [partyA.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_5) {
		let info = getBalanceInfoOfPartyA_0_8_5(source, partyA)
		if (!info) {
			log.warning("Failed to get balance info of partyA {} for version 0.8.5", [partyA.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_4) {
		let info = getBalanceInfoOfPartyA_0_8_4(source, partyA)
		if (!info) {
			log.warning("Failed to get balance info of partyA {} for version 0.8.4", [partyA.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_3) {
		let info = getBalanceInfoOfPartyA_0_8_3(source, partyA)
		if (!info) {
			log.warning("Failed to get balance info of partyA {} for version 0.8.3", [partyA.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_2) {
		let info = getBalanceInfoOfPartyA_0_8_2(source, partyA)
		if (!info) {
			log.warning("Failed to get balance info of partyA {} for version 0.8.2", [partyA.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_1) {
		let info = getBalanceInfoOfPartyA_0_8_1(source, partyA)
		if (!info) {
			log.warning("Failed to get balance info of partyA {} for version 0.8.1", [partyA.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_0) {
		let info = getBalanceInfoOfPartyA_0_8_0(source, partyA)
		if (!info) {
			log.warning("Failed to get balance info of partyA {} for version 0.8.0", [partyA.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	}

	if (!finalizeBalance(entity, event, version, source, partyA)) return

	if (
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
	) {
		clearAffiliateExpressWithdrawBalanceSnapshot(partyA, source, event.block.timestamp, event.block.number)
		if (!isNew) store.remove("LatestAccountBalance", id)
		return
	}

	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
	syncAffiliateExpressWithdrawBalanceSnapshot(entity, event.block.timestamp, event.block.number)
}

export function updatePartyBLatestBalance(event: ethereum.Event, version: Version, partyB: Address, partyA: Address): void {
	let balanceKey = resolvePartyBBalanceKey(event, version, partyB, partyA)
	if (!balanceKey.equals(partyA)) {
		let staleId = partyB.toHexString() + "-" + partyA.toHexString() + "-" + event.address.toHexString()
		store.remove("LatestAccountBalance", staleId)
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

	if (version == Version.v_0_8_6) {
		let info = getBalanceInfoOfPartyB_0_8_6(event.address, balanceKey, partyB)
		if (!info) {
			log.warning("Failed to get balance info of partyB {} for version 0.8.6", [partyB.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_5) {
		let info = getBalanceInfoOfPartyB_0_8_5(event.address, balanceKey, partyB)
		if (!info) {
			log.warning("Failed to get balance info of partyB {} for version 0.8.5", [partyB.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_4) {
		let info = getBalanceInfoOfPartyB_0_8_4(event.address, balanceKey, partyB)
		if (!info) {
			log.warning("Failed to get balance info of partyB {} for version 0.8.4", [partyB.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_3) {
		let info = getBalanceInfoOfPartyB_0_8_3(event.address, balanceKey, partyB)
		if (!info) {
			log.warning("Failed to get balance info of partyB {} for version 0.8.3", [partyB.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_2) {
		let info = getBalanceInfoOfPartyB_0_8_2(event.address, balanceKey, partyB)
		if (!info) {
			log.warning("Failed to get balance info of partyB {} for version 0.8.2", [partyB.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_1) {
		let info = getBalanceInfoOfPartyB_0_8_1(event.address, balanceKey, partyB)
		if (!info) {
			log.warning("Failed to get balance info of partyB {} for version 0.8.1", [partyB.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	} else if (version == Version.v_0_8_0) {
		let info = getBalanceInfoOfPartyB_0_8_0(event.address, balanceKey, partyB)
		if (!info) {
			log.warning("Failed to get balance info of partyB {} for version 0.8.0", [partyB.toHexString()])
			return
		}
		entity.allocatedBalance = info.value0
		entity.lockedCva = info.value1
		entity.lockedLf = info.value2
		entity.lockedPartyAmm = info.value3
		entity.lockedPartyBmm = info.value4
		entity.pendingLockedCva = info.value5
		entity.pendingLockedLf = info.value6
		entity.pendingLockedPartyAmm = info.value7
		entity.pendingLockedPartyBmm = info.value8
	}

	if (!finalizeBalance(entity, event, version, event.address, partyB)) return

	if (
		entity.allocatedBalance.isZero() &&
		entity.lockedCva.isZero() &&
		entity.lockedLf.isZero() &&
		entity.lockedPartyAmm.isZero() &&
		entity.lockedPartyBmm.isZero() &&
		entity.pendingLockedCva.isZero() &&
		entity.pendingLockedLf.isZero() &&
		entity.pendingLockedPartyAmm.isZero() &&
		entity.pendingLockedPartyBmm.isZero()
	) {
		if (!isNew) store.remove("LatestAccountBalance", id)
		return
	}

	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}
