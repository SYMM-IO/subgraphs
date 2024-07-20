import { ethereum } from "@graphprotocol/graph-ts"
import { VaultVersion } from "../../../common/BaseHandler"
import { WithdrawRequestAcceptedEventHandler as CommonWithdrawRequestAcceptedEventHandler } from "../common/WithdrawRequestAcceptedEventHandler"

export class WithdrawRequestAcceptedEventHandler<T> extends CommonWithdrawRequestAcceptedEventHandler<T> {
	handle(_event: ethereum.Event, version: VaultVersion): void {
		super.handle(_event, version)
	}
}
