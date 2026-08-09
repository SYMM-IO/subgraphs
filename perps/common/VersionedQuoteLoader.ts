import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Version } from "./BaseHandler"

import {
	getQuote as getQuote_0_8_0,
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_0,
	getBalanceOf as getBalanceOf_0_8_0,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_0,
} from "./contract_utils_0_8_0"
import {
	getQuote as getQuote_0_8_1,
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_1,
	getBalanceOf as getBalanceOf_0_8_1,
	getLiquidatedStateOfPartyA as getLiqState_0_8_1,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_1,
} from "./contract_utils_0_8_1"
import {
	getQuote as getQuote_0_8_2,
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_2,
	getBalanceOf as getBalanceOf_0_8_2,
	getLiquidatedStateOfPartyA as getLiqState_0_8_2,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_2,
} from "./contract_utils_0_8_2"
import {
	getQuote as getQuote_0_8_3,
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_3,
	getBalanceOf as getBalanceOf_0_8_3,
	getLiquidatedStateOfPartyA as getLiqState_0_8_3,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_3,
} from "./contract_utils_0_8_3"
import {
	getQuote as getQuote_0_8_4,
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_4,
	getBalanceOf as getBalanceOf_0_8_4,
	getLiquidatedStateOfPartyA as getLiqState_0_8_4,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_4,
} from "./contract_utils_0_8_4"
import {
	getQuote as getQuote_0_8_5,
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_5,
	getBalanceOf as getBalanceOf_0_8_5,
	getLiquidatedStateOfPartyA as getLiqState_0_8_5,
	isCrossPartyB as isCrossPartyB_0_8_5,
	partyAReimbursement as partyAReimbursement_0_8_5,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_5,
} from "./contract_utils_0_8_5"
import {
	getQuote as getQuote_0_8_6,
	getBalanceInfoOfPartyA as getBalanceInfoOfPartyA_0_8_6,
	getBalanceOf as getBalanceOf_0_8_6,
	getLiquidationEscrow as getLiquidationEscrow_0_8_6,
	getLiquidatedStateOfPartyA as getLiqState_0_8_6,
	getPartyADeferredBalance as getPartyADeferredBalance_0_8_6,
	isCrossPartyB as isCrossPartyB_0_8_6,
	partyAReimbursement as partyAReimbursement_0_8_6,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_6,
} from "./contract_utils_0_8_6"

/**
 * Normalized quote data that abstracts version-specific field name differences.
 * v0.8.0: mm → partyAmm/partyBmm, maxInterestRate → maxFundingRate, no tradingFee/affiliate
 * v0.8.1-v0.8.2: all fields except affiliate/closeFee
 * v0.8.3-v0.8.4: all fields except closeFee
 * v0.8.5-v0.8.6: all fields including affiliate/closeFee
 */
export class QuoteData {
	cva: BigInt
	lf: BigInt
	partyAmm: BigInt
	partyBmm: BigInt
	avgClosedPrice: BigInt
	closedAmount: BigInt
	openedPrice: BigInt
	initialOpenedPrice: BigInt
	maxFundingRate: BigInt
	orderType: i32
	partyA: Bytes
	partyB: Bytes
	symbolId: BigInt
	tradingFee: BigInt
	closeFee: BigInt
	positionType: i32
	requestedOpenPrice: BigInt
	requestedClosePrice: BigInt
	quantity: BigInt
	quantityToClose: BigInt
	deadline: BigInt
	quoteStatus: i32
	marketPrice: BigInt
	affiliate: Bytes
	partyBsWhiteList: Bytes[]
	accumulatedPaidFunding: BigInt
	lastFundingPaymentTimestamp: BigInt

	constructor() {
		this.cva = BigInt.zero()
		this.lf = BigInt.zero()
		this.partyAmm = BigInt.zero()
		this.partyBmm = BigInt.zero()
		this.avgClosedPrice = BigInt.zero()
		this.closedAmount = BigInt.zero()
		this.openedPrice = BigInt.zero()
		this.initialOpenedPrice = BigInt.zero()
		this.maxFundingRate = BigInt.zero()
		this.orderType = 0
		this.partyA = Address.zero()
		this.partyB = Address.zero()
		this.symbolId = BigInt.zero()
		this.tradingFee = BigInt.zero()
		this.closeFee = BigInt.zero()
		this.positionType = 0
		this.requestedOpenPrice = BigInt.zero()
		this.requestedClosePrice = BigInt.zero()
		this.quantity = BigInt.zero()
		this.quantityToClose = BigInt.zero()
		this.deadline = BigInt.zero()
		this.quoteStatus = 0
		this.marketPrice = BigInt.zero()
		this.affiliate = Address.zero()
		this.partyBsWhiteList = []
		this.accumulatedPaidFunding = BigInt.zero()
		this.lastFundingPaymentTimestamp = BigInt.zero()
	}
}

/**
 * Normalized liquidation state data. Available from v0.8.1+.
 * v0.8.1-v0.8.2: liquidationTimestamp falls back to timestamp
 * v0.8.3+: has separate liquidationTimestamp
 */
export class LiquidationStateData {
	liquidationId: Bytes
	liquidationType: i32
	upnl: BigInt
	totalUnrealizedLoss: BigInt
	deficit: BigInt
	liquidationFee: BigInt
	timestamp: BigInt
	involvedPartyBCounts: BigInt
	partyAAccumulatedUpnl: BigInt
	disputed: boolean
	liquidationTimestamp: BigInt

	constructor() {
		this.liquidationId = Address.zero()
		this.liquidationType = 0
		this.upnl = BigInt.zero()
		this.totalUnrealizedLoss = BigInt.zero()
		this.deficit = BigInt.zero()
		this.liquidationFee = BigInt.zero()
		this.timestamp = BigInt.zero()
		this.involvedPartyBCounts = BigInt.zero()
		this.partyAAccumulatedUpnl = BigInt.zero()
		this.disputed = false
		this.liquidationTimestamp = BigInt.zero()
	}
}

export class PartyABalanceInfoData {
	allocatedBalance: BigInt
	lockedCva: BigInt
	lockedLf: BigInt
	lockedPartyAmm: BigInt
	lockedPartyBmm: BigInt
	pendingLockedCva: BigInt
	pendingLockedLf: BigInt
	pendingLockedPartyAmm: BigInt
	pendingLockedPartyBmm: BigInt
	freeBalance: BigInt

	constructor() {
		this.allocatedBalance = BigInt.zero()
		this.lockedCva = BigInt.zero()
		this.lockedLf = BigInt.zero()
		this.lockedPartyAmm = BigInt.zero()
		this.lockedPartyBmm = BigInt.zero()
		this.pendingLockedCva = BigInt.zero()
		this.pendingLockedLf = BigInt.zero()
		this.pendingLockedPartyAmm = BigInt.zero()
		this.pendingLockedPartyBmm = BigInt.zero()
		this.freeBalance = BigInt.zero()
	}
}

export class PartyASettlementBalanceData {
	reimbursement: BigInt | null
	deferredBalance: BigInt | null
	liquidationEscrow: BigInt | null

	constructor() {
		this.reimbursement = null
		this.deferredBalance = null
		this.liquidationEscrow = null
	}
}

function convertAddressArrayToBytes(addresses: Address[]): Bytes[] {
	let result: Bytes[] = []
	for (let i = 0, len = addresses.length; i < len; i++) {
		result.push(addresses[i])
	}
	return result
}

/**
 * Load quote data from the contract, normalizing version-specific field names.
 * Returns null if the contract call reverts.
 */
export function getQuoteData(version: Version, address: Address, id: BigInt): QuoteData | null {
	let data = new QuoteData()

	switch (version) {
		case Version.v_0_8_0: {
			let q = getQuote_0_8_0(address, id)
			if (!q) return null
			data.cva = q.lockedValues.cva
			data.lf = q.lockedValues.lf
			data.partyAmm = q.lockedValues.mm
			data.partyBmm = q.lockedValues.mm
			data.avgClosedPrice = q.avgClosedPrice
			data.openedPrice = q.openedPrice
			data.maxFundingRate = q.maxInterestRate
			data.orderType = q.orderType
			data.partyA = q.partyA
			data.partyB = q.partyB
			data.symbolId = q.symbolId
			data.tradingFee = BigInt.zero()
			data.positionType = q.positionType
			data.requestedOpenPrice = q.requestedOpenPrice
			data.quantity = q.quantity
			data.deadline = q.deadline
			data.quoteStatus = q.quoteStatus
			data.marketPrice = q.marketPrice
			if (q.partyBsWhiteList) data.partyBsWhiteList = convertAddressArrayToBytes(q.partyBsWhiteList)
			break
		}
		case Version.v_0_8_1: {
			let q = getQuote_0_8_1(address, id)
			if (!q) return null
			data.cva = q.lockedValues.cva
			data.lf = q.lockedValues.lf
			data.partyAmm = q.lockedValues.partyAmm
			data.partyBmm = q.lockedValues.partyBmm
			data.avgClosedPrice = q.avgClosedPrice
			data.closedAmount = q.closedAmount
			data.openedPrice = q.openedPrice
			data.initialOpenedPrice = q.initialOpenedPrice
			data.maxFundingRate = q.maxFundingRate
			data.orderType = q.orderType
			data.partyA = q.partyA
			data.partyB = q.partyB
			data.symbolId = q.symbolId
			data.tradingFee = q.tradingFee
			data.positionType = q.positionType
			data.requestedOpenPrice = q.requestedOpenPrice
			data.requestedClosePrice = q.requestedClosePrice
			data.quantity = q.quantity
			data.quantityToClose = q.quantityToClose
			data.deadline = q.deadline
			data.quoteStatus = q.quoteStatus
			data.marketPrice = q.marketPrice
			data.lastFundingPaymentTimestamp = q.lastFundingPaymentTimestamp
			if (q.partyBsWhiteList) data.partyBsWhiteList = convertAddressArrayToBytes(q.partyBsWhiteList)
			break
		}
		case Version.v_0_8_2: {
			let q = getQuote_0_8_2(address, id)
			if (!q) return null
			data.cva = q.lockedValues.cva
			data.lf = q.lockedValues.lf
			data.partyAmm = q.lockedValues.partyAmm
			data.partyBmm = q.lockedValues.partyBmm
			data.avgClosedPrice = q.avgClosedPrice
			data.openedPrice = q.openedPrice
			data.maxFundingRate = q.maxFundingRate
			data.orderType = q.orderType
			data.partyA = q.partyA
			data.partyB = q.partyB
			data.symbolId = q.symbolId
			data.tradingFee = q.tradingFee
			data.positionType = q.positionType
			data.requestedOpenPrice = q.requestedOpenPrice
			data.quantity = q.quantity
			data.deadline = q.deadline
			data.quoteStatus = q.quoteStatus
			data.marketPrice = q.marketPrice
			data.lastFundingPaymentTimestamp = q.lastFundingPaymentTimestamp
			if (q.partyBsWhiteList) data.partyBsWhiteList = convertAddressArrayToBytes(q.partyBsWhiteList)
			break
		}
		case Version.v_0_8_3: {
			let q = getQuote_0_8_3(address, id)
			if (!q) return null
			data.cva = q.lockedValues.cva
			data.lf = q.lockedValues.lf
			data.partyAmm = q.lockedValues.partyAmm
			data.partyBmm = q.lockedValues.partyBmm
			data.avgClosedPrice = q.avgClosedPrice
			data.openedPrice = q.openedPrice
			data.maxFundingRate = q.maxFundingRate
			data.orderType = q.orderType
			data.partyA = q.partyA
			data.partyB = q.partyB
			data.symbolId = q.symbolId
			data.tradingFee = q.tradingFee
			data.positionType = q.positionType
			data.requestedOpenPrice = q.requestedOpenPrice
			data.quantity = q.quantity
			data.deadline = q.deadline
			data.quoteStatus = q.quoteStatus
			data.marketPrice = q.marketPrice
			data.affiliate = q.affiliate
			data.lastFundingPaymentTimestamp = q.lastFundingPaymentTimestamp
			if (q.partyBsWhiteList) data.partyBsWhiteList = convertAddressArrayToBytes(q.partyBsWhiteList)
			break
		}
		case Version.v_0_8_4: {
			let q = getQuote_0_8_4(address, id)
			if (!q) return null
			data.cva = q.lockedValues.cva
			data.lf = q.lockedValues.lf
			data.partyAmm = q.lockedValues.partyAmm
			data.partyBmm = q.lockedValues.partyBmm
			data.avgClosedPrice = q.avgClosedPrice
			data.openedPrice = q.openedPrice
			data.maxFundingRate = q.maxFundingRate
			data.orderType = q.orderType
			data.partyA = q.partyA
			data.partyB = q.partyB
			data.symbolId = q.symbolId
			data.tradingFee = q.tradingFee
			data.positionType = q.positionType
			data.requestedOpenPrice = q.requestedOpenPrice
			data.quantity = q.quantity
			data.deadline = q.deadline
			data.quoteStatus = q.quoteStatus
			data.marketPrice = q.marketPrice
			data.affiliate = q.affiliate
			data.lastFundingPaymentTimestamp = q.lastFundingPaymentTimestamp
			if (q.partyBsWhiteList) data.partyBsWhiteList = convertAddressArrayToBytes(q.partyBsWhiteList)
			break
		}
		case Version.v_0_8_5: {
			let q = getQuote_0_8_5(address, id)
			if (!q) return null
			data.cva = q.lockedValues.cva
			data.lf = q.lockedValues.lf
			data.partyAmm = q.lockedValues.partyAmm
			data.partyBmm = q.lockedValues.partyBmm
			data.avgClosedPrice = q.avgClosedPrice
			data.openedPrice = q.openedPrice
			data.maxFundingRate = q.maxFundingRate
			data.orderType = q.orderType
			data.partyA = q.partyA
			data.partyB = q.partyB
			data.symbolId = q.symbolId
			data.tradingFee = q.tradingFee
			data.closeFee = q.closeFee
			data.positionType = q.positionType
			data.requestedOpenPrice = q.requestedOpenPrice
			data.quantity = q.quantity
			data.deadline = q.deadline
			data.quoteStatus = q.quoteStatus
			data.marketPrice = q.marketPrice
			data.affiliate = q.affiliate
			data.accumulatedPaidFunding = q.accumulatedPaidFunding
			data.lastFundingPaymentTimestamp = q.lastFundingPaymentTimestamp
			if (q.partyBsWhiteList) data.partyBsWhiteList = convertAddressArrayToBytes(q.partyBsWhiteList)
			break
		}
		case Version.v_0_8_6: {
			let q = getQuote_0_8_6(address, id)
			if (!q) return null
			data.cva = q.lockedValues.cva
			data.lf = q.lockedValues.lf
			data.partyAmm = q.lockedValues.partyAmm
			data.partyBmm = q.lockedValues.partyBmm
			data.avgClosedPrice = q.avgClosedPrice
			data.closedAmount = q.closedAmount
			data.openedPrice = q.openedPrice
			data.initialOpenedPrice = q.initialOpenedPrice
			data.maxFundingRate = q.maxFundingRate
			data.orderType = q.orderType
			data.partyA = q.partyA
			data.partyB = q.partyB
			data.symbolId = q.symbolId
			data.tradingFee = q.tradingFee
			data.closeFee = q.closeFee
			data.positionType = q.positionType
			data.requestedOpenPrice = q.requestedOpenPrice
			data.requestedClosePrice = q.requestedClosePrice
			data.quantity = q.quantity
			data.quantityToClose = q.quantityToClose
			data.deadline = q.deadline
			data.quoteStatus = q.quoteStatus
			data.marketPrice = q.marketPrice
			data.affiliate = q.affiliate
			data.accumulatedPaidFunding = q.accumulatedPaidFunding
			data.lastFundingPaymentTimestamp = q.lastFundingPaymentTimestamp
			if (q.partyBsWhiteList) data.partyBsWhiteList = convertAddressArrayToBytes(q.partyBsWhiteList)
			break
		}
	}

	return data
}

/**
 * Resolve symbol name from symbolId, dispatching to the correct contract version.
 */
export function getSymbolName(version: Version, symbolId: BigInt, address: Address): string {
	switch (version) {
		case Version.v_0_8_0:
			return symbolIdToSymbolName_0_8_0(symbolId, address)
		case Version.v_0_8_1:
			return symbolIdToSymbolName_0_8_1(symbolId, address)
		case Version.v_0_8_2:
			return symbolIdToSymbolName_0_8_2(symbolId, address)
		case Version.v_0_8_3:
			return symbolIdToSymbolName_0_8_3(symbolId, address)
		case Version.v_0_8_4:
			return symbolIdToSymbolName_0_8_4(symbolId, address)
		case Version.v_0_8_5:
			return symbolIdToSymbolName_0_8_5(symbolId, address)
		case Version.v_0_8_6:
			return symbolIdToSymbolName_0_8_6(symbolId, address)
		default:
			return ""
	}
}

function setPartyABalanceFields(
	data: PartyABalanceInfoData,
	allocatedBalance: BigInt,
	lockedCva: BigInt,
	lockedLf: BigInt,
	lockedPartyAmm: BigInt,
	lockedPartyBmm: BigInt,
	pendingLockedCva: BigInt,
	pendingLockedLf: BigInt,
	pendingLockedPartyAmm: BigInt,
	pendingLockedPartyBmm: BigInt,
): void {
	data.allocatedBalance = allocatedBalance
	data.lockedCva = lockedCva
	data.lockedLf = lockedLf
	data.lockedPartyAmm = lockedPartyAmm
	data.lockedPartyBmm = lockedPartyBmm
	data.pendingLockedCva = pendingLockedCva
	data.pendingLockedLf = pendingLockedLf
	data.pendingLockedPartyAmm = pendingLockedPartyAmm
	data.pendingLockedPartyBmm = pendingLockedPartyBmm
}

function getBalanceOfData(version: Version, address: Address, account: Address): BigInt | null {
	switch (version) {
		case Version.v_0_8_0:
			return getBalanceOf_0_8_0(address, account)
		case Version.v_0_8_1:
			return getBalanceOf_0_8_1(address, account)
		case Version.v_0_8_2:
			return getBalanceOf_0_8_2(address, account)
		case Version.v_0_8_3:
			return getBalanceOf_0_8_3(address, account)
		case Version.v_0_8_4:
			return getBalanceOf_0_8_4(address, account)
		case Version.v_0_8_5:
			return getBalanceOf_0_8_5(address, account)
		case Version.v_0_8_6:
			return getBalanceOf_0_8_6(address, account)
		default:
			return null
	}
}

export function getPartyABalanceInfoData(version: Version, address: Address, partyA: Address): PartyABalanceInfoData | null {
	let data = new PartyABalanceInfoData()

	switch (version) {
		case Version.v_0_8_0: {
			let info = getBalanceInfoOfPartyA_0_8_0(address, partyA)
			if (!info) return null
			setPartyABalanceFields(
				data,
				info.value0,
				info.value1,
				info.value2,
				info.value3,
				info.value4,
				info.value5,
				info.value6,
				info.value7,
				info.value8,
			)
			break
		}
		case Version.v_0_8_1: {
			let info = getBalanceInfoOfPartyA_0_8_1(address, partyA)
			if (!info) return null
			setPartyABalanceFields(
				data,
				info.value0,
				info.value1,
				info.value2,
				info.value3,
				info.value4,
				info.value5,
				info.value6,
				info.value7,
				info.value8,
			)
			break
		}
		case Version.v_0_8_2: {
			let info = getBalanceInfoOfPartyA_0_8_2(address, partyA)
			if (!info) return null
			setPartyABalanceFields(
				data,
				info.value0,
				info.value1,
				info.value2,
				info.value3,
				info.value4,
				info.value5,
				info.value6,
				info.value7,
				info.value8,
			)
			break
		}
		case Version.v_0_8_3: {
			let info = getBalanceInfoOfPartyA_0_8_3(address, partyA)
			if (!info) return null
			setPartyABalanceFields(
				data,
				info.value0,
				info.value1,
				info.value2,
				info.value3,
				info.value4,
				info.value5,
				info.value6,
				info.value7,
				info.value8,
			)
			break
		}
		case Version.v_0_8_4: {
			let info = getBalanceInfoOfPartyA_0_8_4(address, partyA)
			if (!info) return null
			setPartyABalanceFields(
				data,
				info.value0,
				info.value1,
				info.value2,
				info.value3,
				info.value4,
				info.value5,
				info.value6,
				info.value7,
				info.value8,
			)
			break
		}
		case Version.v_0_8_5: {
			let info = getBalanceInfoOfPartyA_0_8_5(address, partyA)
			if (!info) return null
			setPartyABalanceFields(
				data,
				info.value0,
				info.value1,
				info.value2,
				info.value3,
				info.value4,
				info.value5,
				info.value6,
				info.value7,
				info.value8,
			)
			break
		}
		case Version.v_0_8_6: {
			let info = getBalanceInfoOfPartyA_0_8_6(address, partyA)
			if (!info) return null
			setPartyABalanceFields(
				data,
				info.value0,
				info.value1,
				info.value2,
				info.value3,
				info.value4,
				info.value5,
				info.value6,
				info.value7,
				info.value8,
			)
			break
		}
	}

	let freeBalance = getBalanceOfData(version, address, partyA)
	if (freeBalance === null) return null
	data.freeBalance = freeBalance
	return data
}

export function getPartyASettlementBalanceData(version: Version, address: Address, partyA: Address): PartyASettlementBalanceData | null {
	if (version < Version.v_0_8_5) return null

	let data = new PartyASettlementBalanceData()
	if (version == Version.v_0_8_5) {
		data.reimbursement = partyAReimbursement_0_8_5(address, partyA)
		return data
	}
	if (version == Version.v_0_8_6) {
		data.reimbursement = partyAReimbursement_0_8_6(address, partyA)
		data.deferredBalance = getPartyADeferredBalance_0_8_6(address, partyA)
		data.liquidationEscrow = getLiquidationEscrow_0_8_6(address, partyA)
		return data
	}
	return null
}

export function getPartyBSettlementMode(version: Version, address: Address, partyB: Address): string {
	if (version == Version.v_0_8_6) return isCrossPartyB_0_8_6(address, partyB) ? "cross" : "isolated"
	if (version == Version.v_0_8_5) return isCrossPartyB_0_8_5(address, partyB) ? "cross" : "isolated"
	return "isolated"
}

/**
 * Load liquidation state for partyA. Returns null for v0.8.0 (not available) or on revert.
 * For v0.8.1-v0.8.2, liquidationTimestamp is set to timestamp (field didn't exist yet).
 */
export function getLiquidationStateData(version: Version, address: Address, partyA: Address): LiquidationStateData | null {
	if (version == Version.v_0_8_0) return null

	let data = new LiquidationStateData()

	switch (version) {
		case Version.v_0_8_1: {
			let d = getLiqState_0_8_1(address, partyA)
			if (!d) return null
			data.liquidationId = d.liquidationId
			data.liquidationType = d.liquidationType
			data.upnl = d.upnl
			data.totalUnrealizedLoss = d.totalUnrealizedLoss
			data.deficit = d.deficit
			data.liquidationFee = d.liquidationFee
			data.timestamp = d.timestamp
			data.involvedPartyBCounts = d.involvedPartyBCounts
			data.partyAAccumulatedUpnl = d.partyAAccumulatedUpnl
			data.disputed = d.disputed
			data.liquidationTimestamp = d.timestamp
			break
		}
		case Version.v_0_8_2: {
			let d = getLiqState_0_8_2(address, partyA)
			if (!d) return null
			data.liquidationId = d.liquidationId
			data.liquidationType = d.liquidationType
			data.upnl = d.upnl
			data.totalUnrealizedLoss = d.totalUnrealizedLoss
			data.deficit = d.deficit
			data.liquidationFee = d.liquidationFee
			data.timestamp = d.timestamp
			data.involvedPartyBCounts = d.involvedPartyBCounts
			data.partyAAccumulatedUpnl = d.partyAAccumulatedUpnl
			data.disputed = d.disputed
			data.liquidationTimestamp = d.timestamp
			break
		}
		case Version.v_0_8_3: {
			let d = getLiqState_0_8_3(address, partyA)
			if (!d) return null
			data.liquidationId = d.liquidationId
			data.liquidationType = d.liquidationType
			data.upnl = d.upnl
			data.totalUnrealizedLoss = d.totalUnrealizedLoss
			data.deficit = d.deficit
			data.liquidationFee = d.liquidationFee
			data.timestamp = d.timestamp
			data.involvedPartyBCounts = d.involvedPartyBCounts
			data.partyAAccumulatedUpnl = d.partyAAccumulatedUpnl
			data.disputed = d.disputed
			data.liquidationTimestamp = d.liquidationTimestamp
			break
		}
		case Version.v_0_8_4: {
			let d = getLiqState_0_8_4(address, partyA)
			if (!d) return null
			data.liquidationId = d.liquidationId
			data.liquidationType = d.liquidationType
			data.upnl = d.upnl
			data.totalUnrealizedLoss = d.totalUnrealizedLoss
			data.deficit = d.deficit
			data.liquidationFee = d.liquidationFee
			data.timestamp = d.timestamp
			data.involvedPartyBCounts = d.involvedPartyBCounts
			data.partyAAccumulatedUpnl = d.partyAAccumulatedUpnl
			data.disputed = d.disputed
			data.liquidationTimestamp = d.liquidationTimestamp
			break
		}
		case Version.v_0_8_5: {
			let d = getLiqState_0_8_5(address, partyA)
			if (!d) return null
			data.liquidationId = d.liquidationId
			data.liquidationType = d.liquidationType
			data.upnl = d.upnl
			data.totalUnrealizedLoss = d.totalUnrealizedLoss
			data.deficit = d.deficit
			data.liquidationFee = d.liquidationFee
			data.timestamp = d.timestamp
			data.involvedPartyBCounts = d.involvedPartyBCounts
			data.partyAAccumulatedUpnl = d.partyAAccumulatedUpnl
			data.disputed = d.disputed
			data.liquidationTimestamp = d.liquidationTimestamp
			break
		}
		case Version.v_0_8_6: {
			let d = getLiqState_0_8_6(address, partyA)
			if (!d) return null
			data.liquidationId = d.liquidationId
			data.liquidationType = d.liquidationType
			data.upnl = d.upnl
			data.totalUnrealizedLoss = d.totalUnrealizedLoss
			data.deficit = d.deficit
			data.liquidationFee = d.liquidationFee
			data.timestamp = d.timestamp
			data.involvedPartyBCounts = d.involvedPartyBCounts
			data.partyAAccumulatedUpnl = d.partyAAccumulatedUpnl
			data.disputed = d.disputed
			data.liquidationTimestamp = d.liquidationTimestamp
			break
		}
	}

	return data
}
