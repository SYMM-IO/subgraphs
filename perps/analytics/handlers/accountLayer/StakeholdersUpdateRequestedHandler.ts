
import { StakeholdersUpdateRequestedHandler as CommonStakeholdersUpdateRequestedHandler } from "../../../common/handlers/accountLayer/StakeholdersUpdateRequestedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class StakeholdersUpdateRequestedHandler<T> extends CommonStakeholdersUpdateRequestedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
