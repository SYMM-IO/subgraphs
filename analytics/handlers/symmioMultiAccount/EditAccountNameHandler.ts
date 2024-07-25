import { ethereum } from "@graphprotocol/graph-ts"
import { EditAccountNameHandler as CommonEditAccountNameHandler } from "../../../common/handlers/symmioMultiAccount/EditAccountNameHandler"
import { Version } from "../../../common/BaseHandler";

export class EditAccountNameHandler<T> extends CommonEditAccountNameHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {

	}
}
