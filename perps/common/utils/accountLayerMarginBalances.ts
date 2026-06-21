import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../BaseHandler"
import { updatePartyALatestBalanceForSource } from "../../analytics/utils/latestAccountBalance"

export function refreshAccountLayerMarginLatestBalances(
	event: ethereum.Event,
	coreSource: Bytes | null,
	subAccount: Address,
	virtualAccount: Address,
): void {
	if (coreSource === null) return

	let source = Address.fromBytes(coreSource)
	updatePartyALatestBalanceForSource(event, Version.v_0_8_6, source, subAccount)
	updatePartyALatestBalanceForSource(event, Version.v_0_8_6, source, virtualAccount)
}
