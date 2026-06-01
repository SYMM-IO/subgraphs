import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Version } from "./BaseHandler"

import { getQuote as getQuote_0_8_0, symbolIdToSymbolName as symbolIdToSymbolName_0_8_0 } from "./contract_utils_0_8_0"
import {
	getQuote as getQuote_0_8_1,
	getLiquidatedStateOfPartyA as getLiqState_0_8_1,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_1,
} from "./contract_utils_0_8_1"
import {
	getQuote as getQuote_0_8_2,
	getLiquidatedStateOfPartyA as getLiqState_0_8_2,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_2,
} from "./contract_utils_0_8_2"
import {
	getQuote as getQuote_0_8_3,
	getLiquidatedStateOfPartyA as getLiqState_0_8_3,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_3,
} from "./contract_utils_0_8_3"
import {
	getQuote as getQuote_0_8_4,
	getLiquidatedStateOfPartyA as getLiqState_0_8_4,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_4,
} from "./contract_utils_0_8_4"
import {
	getQuote as getQuote_0_8_5,
	getLiquidatedStateOfPartyA as getLiqState_0_8_5,
	symbolIdToSymbolName as symbolIdToSymbolName_0_8_5,
} from "./contract_utils_0_8_5"
import {
	getQuote as getQuote_0_8_6,
	getLiquidatedStateOfPartyA as getLiqState_0_8_6,
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
	openedPrice: BigInt
	maxFundingRate: BigInt
	orderType: i32
	partyA: Bytes
	symbolId: BigInt
	tradingFee: BigInt
	closeFee: BigInt
	positionType: i32
	requestedOpenPrice: BigInt
	quantity: BigInt
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
		this.openedPrice = BigInt.zero()
		this.maxFundingRate = BigInt.zero()
		this.orderType = 0
		this.partyA = Address.zero()
		this.symbolId = BigInt.zero()
		this.tradingFee = BigInt.zero()
		this.closeFee = BigInt.zero()
		this.positionType = 0
		this.requestedOpenPrice = BigInt.zero()
		this.quantity = BigInt.zero()
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
			data.openedPrice = q.openedPrice
			data.maxFundingRate = q.maxFundingRate
			data.orderType = q.orderType
			data.partyA = q.partyA
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
			data.openedPrice = q.openedPrice
			data.maxFundingRate = q.maxFundingRate
			data.orderType = q.orderType
			data.partyA = q.partyA
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
