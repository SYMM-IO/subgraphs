import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Account, LiquidationDetail } from "../../../../generated/schema"
import { getPartyABalanceInfoData } from "../../VersionedQuoteLoader"
import { calculateDeferredBalanceAtStart, calculateFreeMarginAtStart, calculateLossRestsAt } from "../../utils/liquidationDetail"
import { setLiquidationDetailProfileRefs } from "../../utils/profile"

export class DeferredLiquidatePartyAHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entity = new LiquidationDetail(
			event.params.partyA.toHexString() + "-" + event.params.liquidationId.toHexString() + "-" + event.address.toHexString(),
		)
		entity.source = event.address
		entity.partyA = event.params.partyA
		entity.partyAAccount = event.params.partyA.toHexString()
		entity.liquidationId = event.params.liquidationId
		entity.liquidationType = 0
		entity.upnl = event.params.upnl
		entity.totalUnrealizedLoss = event.params.totalUnrealizedLoss
		entity.deficit = BigInt.zero()
		entity.liquidationFee = BigInt.zero()
		entity.timestamp = _event.block.timestamp
		entity.involvedPartyBCounts = BigInt.zero()
		entity.partyAAccumulatedUpnl = BigInt.zero()
		entity.disputed = false
		entity.liquidationTimestamp = event.params.liquidationTimestamp
		entity.liquidator = event.params.liquidator
		entity.allocatedBalance = event.params.allocatedBalance
		let balanceInfo = getPartyABalanceInfoData(version, event.address, event.params.partyA)
		if (balanceInfo) {
			let allocatedBalanceAtStart = event.params.liquidationAllocatedBalance
			entity.freeBalance = balanceInfo.freeBalance
			entity.freeMarginAtStart = calculateFreeMarginAtStart(allocatedBalanceAtStart, balanceInfo.lockedCva, balanceInfo.lockedLf)
			entity.lockedCva = balanceInfo.lockedCva
			entity.lockedLf = balanceInfo.lockedLf
			entity.lockedPartyAmm = balanceInfo.lockedPartyAmm
			entity.lockedPartyBmm = balanceInfo.lockedPartyBmm
			entity.lossRestsAt = calculateLossRestsAt(allocatedBalanceAtStart, balanceInfo.lockedCva, balanceInfo.lockedLf, event.params.upnl)
		}
		if (version >= Version.v_0_8_5) entity.reimbursement = BigInt.zero()
		if (version >= Version.v_0_8_6) {
			entity.deferredBalance = calculateDeferredBalanceAtStart(event.params.allocatedBalance, event.params.liquidationAllocatedBalance)
			entity.liquidationEscrow = BigInt.zero()
		}
		entity.settled = false
		entity.fullyLiquidated = false
		entity.takeover = false
		entity.autoTakeover = false
		entity.takeoverSettled = false
		entity.totalPnl = BigInt.zero()
		entity.paidCva = BigInt.zero()
		entity.paidLf = BigInt.zero()
		entity.potentialLf = BigInt.zero()
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
		setLiquidationDetailProfileRefs(entity, partyAAccount, event.address)
		entity.save()
	}
}
