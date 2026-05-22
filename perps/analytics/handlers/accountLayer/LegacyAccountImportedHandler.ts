import { LegacyAccountImportedHandler as CommonLegacyAccountImportedHandler } from "../../../common/handlers/accountLayer/LegacyAccountImportedHandler"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Account } from "../../../../generated/schema"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import {
	removeAffiliateExpressWithdrawAccountMembership,
	syncAffiliateExpressWithdrawAccountPendingRequests,
	syncAffiliateExpressWithdrawAccountMembership,
} from "../../utils/affiliateExpressWithdrawComponents"

export class LegacyAccountImportedHandler<T> extends CommonLegacyAccountImportedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let previousSource: Bytes | null = null
		let previousAccount = Account.load(event.params.account.toHexString())
		if (previousAccount) {
			if (previousAccount.coreSource) previousSource = previousAccount.coreSource
			else previousSource = previousAccount.source
		}
		removeAffiliateExpressWithdrawAccountMembership(event.params.account, null, event.block.timestamp, event.block.number)
		// @ts-ignore
		super.handleAccount(_event, version)
		let account = Account.load(event.params.account.toHexString())
		if (account) {
			syncAffiliateExpressWithdrawAccountMembership(account, event.block.timestamp, event.block.number)
			syncAffiliateExpressWithdrawAccountPendingRequests(account, previousSource, event.block.timestamp, event.block.number)
		}
	}
}
