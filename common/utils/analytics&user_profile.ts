import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { User as UserModel, Account as AccountModel } from "../../generated/schema"

export function createNewUser(
    address: Bytes,
    block: ethereum.Block,
    transaction: ethereum.Transaction,
): UserModel {
    let user = new UserModel(address.toHexString())
    user.timestamp = block.timestamp
    user.transaction = transaction.hash
    user.save()
    return user
}

export function createNewAccount(
    address: Bytes,
    user: UserModel,
    accountSource: Bytes | null,
    block: ethereum.Block,
    transaction: ethereum.Transaction,
    name: string | null = null,
): AccountModel {
    let account = new AccountModel(address.toHexString())
    account.lastActivityTimestamp = block.timestamp
    account.timestamp = block.timestamp
    account.transaction = transaction.hash
    account.deposit = BigInt.zero()
    account.withdraw = BigInt.zero()
    account.allocated = BigInt.zero()
    account.deallocated = BigInt.zero()
    account.quotesCount = BigInt.zero()
    account.positionsCount = BigInt.zero()
    account.user = Bytes.fromHexString(user.id)
    account.user = user.address
    account.updateTimestamp = block.timestamp
    account.accountSource = accountSource
    account.name = name
    account.save()
    return account
}