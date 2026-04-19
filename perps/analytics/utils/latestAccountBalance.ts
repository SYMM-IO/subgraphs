import { Address, BigInt, ethereum, log, store } from "@graphprotocol/graph-ts"
import { Version } from "../../common/BaseHandler"
import { LatestAccountBalance } from "../../../generated/schema"
import { getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_0, getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_0 } from "../../common/contract_utils_0_8_0"
import { getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_1, getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_1 } from "../../common/contract_utils_0_8_1"
import { getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_2, getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_2 } from "../../common/contract_utils_0_8_2"
import { getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_3, getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_3 } from "../../common/contract_utils_0_8_3"
import { getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_4, getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_4 } from "../../common/contract_utils_0_8_4"
import { getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_5, getBalanceInfoOfPartyB as getBalanceInfoOfPartyB_0_8_5 } from "../../common/contract_utils_0_8_5"

export function updatePartyALatestBalance(event: ethereum.Event, version: Version, partyA: Address): void {
	let id = partyA.toHexString() + "-" + event.address.toHexString()
	let isNew = false
	let entity = LatestAccountBalance.load(id)
	if (!entity) {
		isNew = true
		entity = new LatestAccountBalance(id)
		entity.source = event.address
		entity.account = partyA
		entity.accountRef = partyA.toHexString()
		entity.counterParty = null
		entity.counterPartyRef = null
		entity.accountType = "PARTY_A"
	}

	if (version == Version.v_0_8_5) {
		let info = getBalanceInfoOfPartyA_0_8_5(event.address, partyA)
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
		let info = getBalanceInfoOfPartyA_0_8_4(event.address, partyA)
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
		let info = getBalanceInfoOfPartyA_0_8_3(event.address, partyA)
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
		let info = getBalanceInfoOfPartyA_0_8_2(event.address, partyA)
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
		let info = getBalanceInfoOfPartyA_0_8_1(event.address, partyA)
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
		let info = getBalanceInfoOfPartyA_0_8_0(event.address, partyA)
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

export function updatePartyBLatestBalance(event: ethereum.Event, version: Version, partyB: Address, partyA: Address): void {
	let id = partyB.toHexString() + "-" + partyA.toHexString() + "-" + event.address.toHexString()
	let isNew = false
	let entity = LatestAccountBalance.load(id)
	if (!entity) {
		isNew = true
		entity = new LatestAccountBalance(id)
		entity.source = event.address
		entity.account = partyB
		entity.accountRef = partyB.toHexString()
		entity.counterParty = partyA
		entity.counterPartyRef = partyA.toHexString()
		entity.accountType = "PARTY_B"
	}

	if (version == Version.v_0_8_5) {
		let info = getBalanceInfoOfPartyB_0_8_5(event.address, partyA, partyB)
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
		let info = getBalanceInfoOfPartyB_0_8_4(event.address, partyA, partyB)
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
		let info = getBalanceInfoOfPartyB_0_8_3(event.address, partyA, partyB)
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
		let info = getBalanceInfoOfPartyB_0_8_2(event.address, partyA, partyB)
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
		let info = getBalanceInfoOfPartyB_0_8_1(event.address, partyA, partyB)
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
		let info = getBalanceInfoOfPartyB_0_8_0(event.address, partyA, partyB)
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
