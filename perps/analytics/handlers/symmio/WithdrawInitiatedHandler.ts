import { WithdrawInitiatedHandler as CommonWithdrawInitiatedHandler } from "../../../common/handlers/symmio/WithdrawInitiatedHandler"
import { Account, WithdrawRequest } from "../../../../generated/schema"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { setWithdrawRequestProfileRefs } from "../../../common/utils/profile"
import { updateWithdrawHierarchyHistories } from "../../utils/historyHelpers"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { ZERO_ADDRESS } from "../../utils/constants"
import {
	addWithdrawRequestToLookup,
	consumeWithdrawCoreLifecycleHint,
	removeWithdrawRequestFromLookup,
	withdrawRequestId,
} from "../../utils/withdrawRequest"
import {
	applyWithdrawAdvancedToAffiliateExpressWithdrawComponents,
	applyWithdrawRequestToAffiliateExpressWithdrawComponents,
	consumeExpressProviderWithdrawLifecycleHint,
	removeWithdrawRequestFromAffiliateExpressWithdrawComponents,
	setWithdrawRequestAffiliateExpressWithdrawComponentRefs,
} from "../../utils/affiliateExpressWithdrawComponents"

export class WithdrawInitiatedHandler<T> extends CommonWithdrawInitiatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let id = withdrawRequestId(event.params.user, event.params.requestId, _event.address)
		let wr = new WithdrawRequest(id)
		wr.globalCounter = getGlobalCounterAndInc()
		wr.source = _event.address
		wr.requestId = event.params.requestId
		wr.user = event.params.user
		let totalAmount = BigInt.zero()
		let classicAmount = BigInt.zero()
		let expressAmount = BigInt.zero()
		let virtualAmount = BigInt.zero()
		let parts = event.params.parts
		let hasExpress = false
		let hasVirtual = false
		let expressProvider: Address | null = null
		for (let i = 0; i < parts.length; i++) {
			let isExpress = parts[i].expressProvider.toHexString() != ZERO_ADDRESS
			let isVirtual = parts[i].virtualProvider.toHexString() != ZERO_ADDRESS
			totalAmount = totalAmount.plus(parts[i].amount)
			if (isExpress) {
				hasExpress = true
				expressProvider = parts[i].expressProvider
			}
			if (!isExpress && isVirtual) hasVirtual = true
			if (isVirtual) {
				virtualAmount = virtualAmount.plus(parts[i].amount)
			} else if (isExpress) {
				expressAmount = expressAmount.plus(parts[i].amount)
			} else {
				classicAmount = classicAmount.plus(parts[i].amount)
			}
		}
		wr.amount = totalAmount
		wr.classicAmount = classicAmount
		wr.expressAmount = expressAmount
		wr.virtualAmount = virtualAmount
		wr.advancedAmount = BigInt.zero()
		wr.reservedDebtAmount = BigInt.zero()
		wr.activeDebtAmount = BigInt.zero()
		wr.badDebtAmount = BigInt.zero()
		wr.speedUp = event.params.speedUp
		wr.providerData = event.params.providerData
		wr.isPureVirtual = !hasExpress && hasVirtual
		wr.cooldownEndTime = event.params.cooldownEndTime
		wr.status = "PENDING"
		wr.timestamp = _event.block.timestamp
		wr.updateTimestamp = _event.block.timestamp
		wr.blockNumber = _event.block.number
		wr.transaction = _event.transaction.hash
		let account = Account.load(event.params.user.toHexString())
		setWithdrawRequestProfileRefs(wr, account, _event.address)
		setWithdrawRequestAffiliateExpressWithdrawComponentRefs(wr, account, _event.address)
		if (account) {
			updateWithdrawHierarchyHistories(account, _event.block.timestamp, BigInt.fromI32(1), BigInt.fromI32(1), BigInt.zero(), totalAmount)
		}
		wr.save()
		applyWithdrawRequestToAffiliateExpressWithdrawComponents(
			account,
			_event.address,
			classicAmount,
			expressAmount,
			virtualAmount,
			_event.block.timestamp,
			_event.block.number,
		)
		addWithdrawRequestToLookup(wr)
		let hintedAdvancedAmount = consumeWithdrawCoreLifecycleHint(wr, _event.transaction.hash)
		if (!hintedAdvancedAmount.isZero()) {
			applyWithdrawAdvancedToAffiliateExpressWithdrawComponents(wr, hintedAdvancedAmount, _event.block.timestamp, _event.block.number)
		}
		if (expressProvider !== null) {
			consumeExpressProviderWithdrawLifecycleHint(wr, expressProvider, _event.transaction.hash)
		}
		if (wr.status == "PROVIDER_REJECTED") {
			if (account) {
				updateWithdrawHierarchyHistories(account, _event.block.timestamp, BigInt.zero(), BigInt.fromI32(-1), BigInt.zero(), totalAmount.neg())
			}
			removeWithdrawRequestFromAffiliateExpressWithdrawComponents(wr, _event.block.timestamp, _event.block.number)
			wr.save()
			removeWithdrawRequestFromLookup(wr)
		}
		updatePartyALatestBalance(_event, version, event.params.user)
	}
}
