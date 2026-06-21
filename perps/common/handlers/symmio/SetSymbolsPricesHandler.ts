import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Account, LiquidationDetail } from "../../../../generated/schema"
import { getLiquidationStateData, getPartyABalanceInfoData } from "../../VersionedQuoteLoader"
import { SetSymbolsPrices as SetSymbolsPrices_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { SetSymbolsPrices as SetSymbolsPrices_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { SetSymbolsPrices as SetSymbolsPrices_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { setLiquidationDetailProfileRefs } from "../../utils/profile"
import { calculateFreeMarginAtStart, calculateLossRestsAt } from "../../utils/liquidationDetail"

export class SetSymbolsPricesHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		if (version < Version.v_0_8_1) return

		let liqState = getLiquidationStateData(version, event.address, event.params.partyA)
		if (!liqState) return

		// Get liquidationId for entity key: from event in v0.8.3+, from struct in v0.8.1-v0.8.2
		let liquidationId = liqState.liquidationId
		if (version == Version.v_0_8_5) {
			// @ts-ignore
			const event_ = changetype<SetSymbolsPrices_0_8_5>(_event)
			liquidationId = event_.params.liquidationId
		} else if (version == Version.v_0_8_4) {
			// @ts-ignore
			const event_ = changetype<SetSymbolsPrices_0_8_4>(_event)
			liquidationId = event_.params.liquidationId
		} else if (version == Version.v_0_8_3) {
			// @ts-ignore
			const event_ = changetype<SetSymbolsPrices_0_8_3>(_event)
			liquidationId = event_.params.liquidationId
		}

		let entityId = event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) {
			entity = new LiquidationDetail(entityId)
			entity.settled = false
			entity.fullyLiquidated = false
			entity.takeover = false
			entity.autoTakeover = false
			entity.takeoverSettled = false
			entity.totalPnl = BigInt.zero()
			entity.paidCva = BigInt.zero()
			entity.paidLf = BigInt.zero()
			entity.potentialLf = BigInt.zero()
			if (version >= Version.v_0_8_5) entity.reimbursement = BigInt.zero()
			if (version >= Version.v_0_8_6) {
				entity.deferredBalance = BigInt.zero()
				entity.liquidationEscrow = BigInt.zero()
			}
			entity.settlementPartyBs = []
			entity.settlementModes = []
			entity.settlementExpectedAmounts = []
			entity.settlementActualAmounts = []
			entity.settlementCvaReturned = []
			entity.settlementReserveContributions = []
			entity.settlementStates = []
			let partyAAccount = Account.load(event.params.partyA.toHexString())
			if (partyAAccount) {
				entity.affiliate = partyAAccount.accountSource
			}
		}
		entity.source = event.address
		entity.partyA = event.params.partyA
		entity.partyAAccount = event.params.partyA.toHexString()
		entity.liquidationId = liqState.liquidationId
		entity.liquidationType = liqState.liquidationType
		entity.upnl = liqState.upnl
		entity.totalUnrealizedLoss = liqState.totalUnrealizedLoss
		entity.deficit = liqState.deficit
		entity.liquidationFee = liqState.liquidationFee
		entity.timestamp = liqState.timestamp
		entity.involvedPartyBCounts = liqState.involvedPartyBCounts
		entity.partyAAccumulatedUpnl = liqState.partyAAccumulatedUpnl
		entity.disputed = liqState.disputed
		entity.liquidationTimestamp = liqState.liquidationTimestamp
		let balanceInfo = getPartyABalanceInfoData(version, event.address, event.params.partyA)
		if (balanceInfo) {
			let allocatedBalance = entity.allocatedBalance ? entity.allocatedBalance! : balanceInfo.allocatedBalance
			entity.freeBalance = balanceInfo.freeBalance
			entity.freeMarginAtStart = calculateFreeMarginAtStart(allocatedBalance, balanceInfo.lockedCva, balanceInfo.lockedLf)
			entity.lockedCva = balanceInfo.lockedCva
			entity.lockedLf = balanceInfo.lockedLf
			entity.lockedPartyAmm = balanceInfo.lockedPartyAmm
			entity.lockedPartyBmm = balanceInfo.lockedPartyBmm
			entity.lossRestsAt = calculateLossRestsAt(allocatedBalance, balanceInfo.lockedCva, balanceInfo.lockedLf, liqState.upnl)
		}
		setLiquidationDetailProfileRefs(entity, Account.load(event.params.partyA.toHexString()), event.address)
		entity.save()
	}
}
