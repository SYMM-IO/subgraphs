import {ethereum} from "@graphprotocol/graph-ts"
import {
	EditAccountNameHandler as CommonEditAccountNameHandler
} from "../../../common/handlers/symmioMultiAccount/EditAccountNameHandler"
import {MultiAccountVersion} from "../../../common/BaseHandler";
import {Account} from "../../../generated/schema";

export class EditAccountNameHandler<T> extends CommonEditAccountNameHandler<T> {
	handle(_event: ethereum.Event, version: MultiAccountVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.account.toHexString())!
		account.name = event.params.newName
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}
