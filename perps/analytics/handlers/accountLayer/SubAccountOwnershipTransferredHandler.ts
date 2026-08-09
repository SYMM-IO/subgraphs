import { ethereum } from "@graphprotocol/graph-ts"
import { SubAccountOwnershipTransferredHandler as CommonSubAccountOwnershipTransferredHandler } from "../../../common/handlers/accountLayer/SubAccountOwnershipTransferredHandler"
import { Account } from "../../../../generated/schema"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { syncAffiliateExpressWithdrawAccountMembership } from "../../utils/affiliateExpressWithdrawComponents"

export class SubAccountOwnershipTransferredHandler<T> extends CommonSubAccountOwnershipTransferredHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		super.handleAccount(_event, version)
		for (let i = 0; i < this.transferredAccountAddresses.length; i++) {
			let account = Account.load(this.transferredAccountAddresses[i].toHexString())
			if (account) {
				syncAffiliateExpressWithdrawAccountMembership(account, _event.block.timestamp, _event.block.number)
			}
		}
	}
}
