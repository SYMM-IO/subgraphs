import { VirtualAccountCreatedHandler as CommonVirtualAccountCreatedHandler } from "../../../common/handlers/accountLayer/VirtualAccountCreatedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Account } from "../../../../generated/schema"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { syncAffiliateExpressWithdrawAccountMembership } from "../../utils/affiliateExpressWithdrawComponents"

export class VirtualAccountCreatedHandler<T> extends CommonVirtualAccountCreatedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		// @ts-ignore
		super.handleAccount(_event, version)
		let account = Account.load(event.params.account.toHexString())
		if (account) syncAffiliateExpressWithdrawAccountMembership(account, event.block.timestamp, event.block.number)
	}
}
