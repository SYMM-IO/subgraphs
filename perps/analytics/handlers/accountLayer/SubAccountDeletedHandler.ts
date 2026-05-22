import { SubAccountDeletedHandler as CommonSubAccountDeletedHandler } from "../../../common/handlers/accountLayer/SubAccountDeletedHandler"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Account } from "../../../../generated/schema"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import {
	removeAffiliateExpressWithdrawAccountMembership,
	syncAffiliateExpressWithdrawAccountPendingRequests,
} from "../../utils/affiliateExpressWithdrawComponents"

export class SubAccountDeletedHandler<T> extends CommonSubAccountDeletedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let previousSource: Bytes | null = null
		let previousAccount = Account.load(event.params.account.toHexString())
		if (previousAccount) {
			if (previousAccount.coreSource) previousSource = previousAccount.coreSource
			else previousSource = previousAccount.source
		}
		// @ts-ignore
		super.handleAccount(_event, version)
		removeAffiliateExpressWithdrawAccountMembership(event.params.account, null, event.block.timestamp, event.block.number)
		let account = Account.load(event.params.account.toHexString())
		if (account) syncAffiliateExpressWithdrawAccountPendingRequests(account, previousSource, event.block.timestamp, event.block.number)
	}
}
