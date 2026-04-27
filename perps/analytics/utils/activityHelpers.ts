import { Account } from "../../../generated/schema"
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { getDailyHistoryForTimestamp, getMonthlyHistoryForTimestamp, getUserActivity, getWeeklyHistoryForTimestamp } from "./builders"
import { isSameDay, isSameMonth, isSameWeek } from "./time"

export function updateActivityTimestamps(account: Account, timestamp: BigInt, source: Bytes): void {
	account.lastActivityTimestamp = timestamp
	account.save()
	// Skip protocol-level entities — they're not real traders and would inflate activeUsers in the
	// null-accountSource bucket (SOLVER = partyB operators, LIQUIDATOR = bots, BRIDGE = bridge contracts)
	if (account.type == "SOLVER" || account.type == "LIQUIDATOR" || account.type == "BRIDGE") return
	let ua = getUserActivity(account.user, account.accountSource, timestamp)
	let uaTimestamp = ua.updateTimestamp === null ? BigInt.zero() : ua.updateTimestamp!
	if (!isSameDay(timestamp, uaTimestamp)) {
		let dh = getDailyHistoryForTimestamp(timestamp, account.accountSource, source)
		dh.activeUsers = dh.activeUsers.plus(BigInt.fromString("1"))
		dh.save()
	}
	if (!isSameWeek(timestamp, uaTimestamp)) {
		let wh = getWeeklyHistoryForTimestamp(timestamp, account.accountSource, source)
		wh.activeUsers = wh.activeUsers.plus(BigInt.fromString("1"))
		wh.save()
	}
	if (!isSameMonth(timestamp, uaTimestamp)) {
		let mh = getMonthlyHistoryForTimestamp(timestamp, account.accountSource, source)
		mh.activeUsers = mh.activeUsers.plus(BigInt.fromString("1"))
		mh.save()
	}
	ua.updateTimestamp = timestamp
	ua.save()
}
