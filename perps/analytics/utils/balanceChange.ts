import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Account, BalanceChange } from "../../../generated/schema"
import { setCoreEntityProfileSources } from "../../common/utils/profile"

const ADD_MARGIN_SELECTOR = "cf70cb69"
const ADD_MARGIN_TO_NEXT_VA_SELECTOR = "a6d66852"
const REMOVE_MARGIN_SELECTOR = "5ce56265"
const EMERGENCY_RECOVER_MARGIN_SELECTOR = "3279017f"

function findSelector(inputHex: string, selector: string, from: i32 = 0): i32 {
	let localIndex = inputHex.substring(from).indexOf(selector)
	if (localIndex < 0) return -1
	return from + localIndex
}

function addressParam(inputHex: string, selectorIndex: i32, paramIndex: i32): string | null {
	let start = selectorIndex + 8 + paramIndex * 64
	let end = start + 64
	if (end > inputHex.length) return null
	return "0x" + inputHex.substring(start + 24, end)
}

function stripLeadingZeroes(value: string): string {
	let index: i32 = 0
	while (index < value.length - 1 && value.charAt(index) == "0") {
		index++
	}
	return value.substring(index)
}

function uintParamMatches(inputHex: string, selectorIndex: i32, paramIndex: i32, value: BigInt): boolean {
	let start = selectorIndex + 8 + paramIndex * 64
	let end = start + 64
	if (end > inputHex.length) return false

	let paramValue = stripLeadingZeroes(inputHex.substring(start, end).toLowerCase())
	let actualValue = value.toHexString().toLowerCase()
	if (actualValue.startsWith("0x")) actualValue = actualValue.substring(2)
	return paramValue == stripLeadingZeroes(actualValue)
}

function senderHex(entity: BalanceChange): string | null {
	if (entity.sender === null) return null
	return entity.sender!.toHexString()
}

function isAddMarginSideEffect(
	entity: BalanceChange,
	account: Account | null,
	subAccount: string | null,
	virtualAccount: string | null,
	amountMatches: boolean = false,
): boolean {
	if (entity.type != "ALLOCATE" && entity.type != "WITHDRAW") return false

	let accountId = entity.account.toHexString()
	let sender = senderHex(entity)

	if (virtualAccount !== null) {
		if (accountId != virtualAccount) return false
		if (entity.type == "ALLOCATE") return true
		if (subAccount !== null) return sender == subAccount
		return sender !== null && sender != virtualAccount
	}

	if (subAccount === null) return false
	if (entity.type == "WITHDRAW") return sender == subAccount
	if (account !== null && account.subAccount !== null) return account.subAccount == subAccount
	return amountMatches && accountId != subAccount
}

function isRemoveMarginSideEffect(entity: BalanceChange, virtualAccount: string | null): boolean {
	if (virtualAccount === null) return false

	let accountId = entity.account.toHexString()
	let sender = senderHex(entity)

	if (entity.type == "DEALLOCATE") return accountId == virtualAccount
	if (entity.type == "WITHDRAW") return accountId == virtualAccount && sender == virtualAccount
	if (entity.type == "DEPOSIT") return sender == virtualAccount
	return false
}

function isEmergencyRecoverSideEffect(entity: BalanceChange, account: Account | null, subAccount: string | null): boolean {
	if (subAccount === null) return false
	if (entity.type != "DEALLOCATE" && entity.type != "WITHDRAW" && entity.type != "DEPOSIT") return false

	if (entity.type == "DEPOSIT") return entity.account.toHexString() == subAccount
	if (entity.type == "WITHDRAW") return senderHex(entity) == entity.account.toHexString()
	if (account !== null && account.subAccount !== null) return account.subAccount == subAccount
	return true
}

function marginTransferTypeFromInput(entity: BalanceChange, account: Account | null, input: Bytes): string | null {
	let inputHex = input.toHexString()

	let addIndex = findSelector(inputHex, ADD_MARGIN_SELECTOR)
	while (addIndex >= 0) {
		let virtualAccount = addressParam(inputHex, addIndex, 0)
		if (isAddMarginSideEffect(entity, account, null, virtualAccount)) return "ADD"
		addIndex = findSelector(inputHex, ADD_MARGIN_SELECTOR, addIndex + 8)
	}

	let addToNextIndex = findSelector(inputHex, ADD_MARGIN_TO_NEXT_VA_SELECTOR)
	while (addToNextIndex >= 0) {
		let subAccount = addressParam(inputHex, addToNextIndex, 0)
		let amountMatches = uintParamMatches(inputHex, addToNextIndex, 3, entity.amount)
		if (isAddMarginSideEffect(entity, account, subAccount, null, amountMatches)) return "ADD"
		addToNextIndex = findSelector(inputHex, ADD_MARGIN_TO_NEXT_VA_SELECTOR, addToNextIndex + 8)
	}

	let removeIndex = findSelector(inputHex, REMOVE_MARGIN_SELECTOR)
	while (removeIndex >= 0) {
		let virtualAccount = addressParam(inputHex, removeIndex, 0)
		if (isRemoveMarginSideEffect(entity, virtualAccount)) return "REMOVE"
		removeIndex = findSelector(inputHex, REMOVE_MARGIN_SELECTOR, removeIndex + 8)
	}

	let emergencyIndex = findSelector(inputHex, EMERGENCY_RECOVER_MARGIN_SELECTOR)
	while (emergencyIndex >= 0) {
		let subAccount = addressParam(inputHex, emergencyIndex, 0)
		if (isEmergencyRecoverSideEffect(entity, account, subAccount)) return "EMERGENCY_RECOVER"
		emergencyIndex = findSelector(inputHex, EMERGENCY_RECOVER_MARGIN_SELECTOR, emergencyIndex + 8)
	}

	return null
}

export function setBalanceChangeContext(entity: BalanceChange, account: Account | null, source: Bytes, input: Bytes): void {
	let context = setCoreEntityProfileSources(source, account)
	entity.deploymentId = context.deploymentId
	entity.coreSource = context.coreSource
	entity.accountLayerSource = context.accountLayerSource

	if (account !== null) {
		entity.owner = account.owner
		entity.accountKind = account.accountKind
		if (account.subAccount) entity.subAccountRef = account.subAccount
		if (account.virtualAccount) entity.virtualAccountRef = account.virtualAccount
	}

	let marginTransferType = marginTransferTypeFromInput(entity, account, input)
	entity.isMarginTransferSideEffect = marginTransferType !== null
	entity.marginTransferType = marginTransferType
}
