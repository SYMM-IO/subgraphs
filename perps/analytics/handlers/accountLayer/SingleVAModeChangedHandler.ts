import { SingleVAModeChangedHandler as CommonSingleVAModeChangedHandler } from "../../../common/handlers/accountLayer/SingleVAModeChangedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Account } from "../../../../generated/schema"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import {
	syncAffiliateExpressWithdrawAccountPendingRequests,
	syncAffiliateExpressWithdrawAccountMembership,
} from "../../utils/affiliateExpressWithdrawComponents"

export class SingleVAModeChangedHandler<T> extends CommonSingleVAModeChangedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		// @ts-ignore
		super.handleAccount(_event, version)
		let account = Account.load(event.params.subAccount.toHexString())
		if (account) {
			syncAffiliateExpressWithdrawAccountMembership(account, event.block.timestamp, event.block.number)
			syncAffiliateExpressWithdrawAccountPendingRequests(account, null, event.block.timestamp, event.block.number)
		}
	}
}
