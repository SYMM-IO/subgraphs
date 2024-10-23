import {BigInt} from "@graphprotocol/graph-ts";

export function startOfDay(timestamp: BigInt): Date {
	let date = new Date(timestamp.toI64() * 1000)
	date.setUTCHours(0)
	date.setUTCMinutes(0)
	date.setUTCSeconds(0)
	date.setUTCMilliseconds(0)
	return date
}

export function startOfWeek(timestamp: BigInt): Date {
	let date = new Date(timestamp.toI64() * 1000)
	let day = date.getUTCDay()
	let diff = date.getUTCDate() - day
	date.setUTCDate(diff)
	date.setUTCHours(0)
	date.setUTCMinutes(0)
	date.setUTCSeconds(0)
	date.setUTCMilliseconds(0)
	return date
}

export function startOfMonth(timestamp: BigInt): Date {
	let date = new Date(timestamp.toI64() * 1000)
	date.setUTCDate(1)
	date.setUTCHours(0)
	date.setUTCMinutes(0)
	date.setUTCSeconds(0)
	date.setUTCMilliseconds(0)
	return date
}

export function isSameDay(timestamp1: BigInt, timestamp2: BigInt): boolean {
	return startOfDay(timestamp1).getTime().toString() == startOfDay(timestamp2).getTime().toString()
}

export function isSameWeek(timestamp1: BigInt, timestamp2: BigInt): boolean {
	return startOfWeek(timestamp1).getTime().toString() == startOfWeek(timestamp2).getTime().toString()
}

export function isSameMonth(timestamp1: BigInt, timestamp2: BigInt): boolean {
	return startOfMonth(timestamp1).getTime().toString() == startOfMonth(timestamp2).getTime().toString()
}