import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { AccountSuspension, AccountSuspensionLookup } from "../../../generated/schema"

function lookupId(source: Address, user: Address): string {
	return source.toHexString() + "-" + user.toHexString()
}

export function loadLatestSuspension(source: Address, user: Address): AccountSuspension | null {
	let lookup = AccountSuspensionLookup.load(lookupId(source, user))
	if (lookup == null) return null
	return AccountSuspension.load(lookup.suspension)
}

// A missing start remains unknown when indexing first observes an unsuspend or
// withdrawal. Do not fabricate a suspension timestamp from that later event.
export function createSuspension(event: ethereum.Event, user: Address): AccountSuspension {
	let suspension = new AccountSuspension(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
	suspension.source = event.address
	suspension.user = user
	suspension.isSuspended = true
	suspension.withdrawnSuspendedAmount = BigInt.zero()
	suspension.updateTimestamp = event.block.timestamp
	suspension.save()

	let lookup = new AccountSuspensionLookup(lookupId(event.address, user))
	lookup.suspension = suspension.id
	lookup.save()
	return suspension
}
