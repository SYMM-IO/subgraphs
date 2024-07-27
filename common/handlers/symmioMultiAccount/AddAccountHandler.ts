import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BaseHandler, Version } from "../../BaseHandler"
import { getDailyHistoryForTimestamp, getTotalHistory, newUserAndAccount } from "../../../analytics/utils/builders"
import { Account, User } from "../../../generated/schema"
import { createNewAccount, createNewUser } from "../../utils/analytics&user_profile"

export class AddAccountHandler<T> extends BaseHandler {
    handleAccount(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        let user = User.load(event.params.user.toHexString())
        if (user == null) {
            user = createNewUser(event.params.user, event.block, event.transaction)
        } else {
            const dh = getDailyHistoryForTimestamp(event.block.timestamp, event.address)
            dh.newUsers = dh.newUsers.plus(BigInt.fromString("1"))
            dh.save()
            const th = getTotalHistory(event.block.timestamp, event.address)
            th.users = th.users.plus(BigInt.fromString("1"))
            th.save()
        }
        createNewAccount(event.params.account, user, event.address, event.block, event.transaction, event.params.name)
    }
}