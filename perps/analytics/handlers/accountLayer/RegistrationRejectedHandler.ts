
import { RegistrationRejectedHandler as CommonRegistrationRejectedHandler } from "../../../common/handlers/accountLayer/RegistrationRejectedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

export class RegistrationRejectedHandler<T> extends CommonRegistrationRejectedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
	}
}
