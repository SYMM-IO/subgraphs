import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import { Account as AccountModel, User as UserModel } from "../generated/schema"
import { getDailyHistoryForTimestamp, getTotalHistory } from "../analytics/utils"

export function createNewUser(address: Bytes, accountSource: Bytes | null, block: ethereum.Block, transaction: ethereum.Transaction): UserModel {
	let user = new UserModel(address.toHexString())
	user.timestamp = block.timestamp
	user.transaction = transaction.hash
	user.address = address
	user.save()
	const dh = getDailyHistoryForTimestamp(block.timestamp, accountSource)
	dh.newUsers = dh.newUsers.plus(BigInt.fromString("1"))
	dh.save()
	const th = getTotalHistory(block.timestamp, accountSource)
	th.users = th.users.plus(BigInt.fromString("1"))
	th.save()
	return user
}


export function createNewAccount(address: Bytes, user: UserModel, accountSource: Bytes | null, block: ethereum.Block, transaction: ethereum.Transaction, name: string | null = null): AccountModel {
	let account = new AccountModel(address.toHexString())
	account.lastActivityTimestamp = block.timestamp
	account.timestamp = block.timestamp
	account.blockNumber = block.number
	account.transaction = transaction.hash
	account.deposit = BigInt.zero()
	account.withdraw = BigInt.zero()
	account.allocated = BigInt.zero()
	account.deallocated = BigInt.zero()
	account.quotesCount = BigInt.zero()
	account.positionsCount = BigInt.zero()
	account.user = user.address
	account.updateTimestamp = block.timestamp
	account.accountSource = accountSource
	account.name = name
	account.save()
	const dh = getDailyHistoryForTimestamp(block.timestamp, accountSource)
	dh.newAccounts = dh.newAccounts.plus(BigInt.fromString("1"))
	dh.save()
	const th = getTotalHistory(block.timestamp, accountSource)
	th.accounts = th.accounts.plus(BigInt.fromString("1"))
	th.save()
	return account
}