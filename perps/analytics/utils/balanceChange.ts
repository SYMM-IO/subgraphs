import { Bytes } from "@graphprotocol/graph-ts"
import { Account, BalanceChange } from "../../../generated/schema"
import { setCoreEntityProfileSources } from "../../common/utils/profile"

const ADD_MARGIN_SELECTOR = "0xcf70cb69"
const ADD_MARGIN_TO_NEXT_VA_SELECTOR = "0xa6d66852"
const REMOVE_MARGIN_SELECTOR = "0x5ce56265"
const EMERGENCY_RECOVER_MARGIN_SELECTOR = "0x3279017f"

function marginTransferTypeFromInput(input: Bytes): string | null {
	let selector = input.toHexString()
	if (selector.startsWith(ADD_MARGIN_SELECTOR) || selector.startsWith(ADD_MARGIN_TO_NEXT_VA_SELECTOR)) return "ADD"
	if (selector.startsWith(REMOVE_MARGIN_SELECTOR)) return "REMOVE"
	if (selector.startsWith(EMERGENCY_RECOVER_MARGIN_SELECTOR)) return "EMERGENCY_RECOVER"
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

	let marginTransferType = marginTransferTypeFromInput(input)
	entity.isMarginTransferSideEffect = marginTransferType !== null
	entity.marginTransferType = marginTransferType
}
