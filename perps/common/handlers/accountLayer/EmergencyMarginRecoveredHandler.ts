import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { Account, MarginTransfer, VirtualAccount } from "../../../../generated/schema"

export class EmergencyMarginRecoveredHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		// The lost/orphan virtual-account address has no VirtualAccount entity on-chain.
		// Upsert a stub so the MarginTransfer.virtualAccount FK resolves.
		let vaId = event.params.virtualAccount.toHexString()
		let va = VirtualAccount.load(vaId)
		if (!va) {
			va = new VirtualAccount(vaId)
			va.address = event.params.virtualAccount
			va.parent = event.params.subAccount.toHexString()
			va.isDeleted = true
			va.source = event.address
			va.timestamp = event.block.timestamp
			va.updateTimestamp = event.block.timestamp
			va.save()
		}
		// Retroactively tag the lost VA's Account as virtual so query-time filters
		// (e.g. BalanceChange.senderRef_.isVirtual_not: true) exclude the bookkeeping
		// Deposit emitted earlier in the same tx by internalTransferToBalance.
		let lost = Account.load(vaId)
		if (lost) {
			lost.isVirtual = true
			lost.parentAddress = event.params.subAccount
			lost.subAccount = event.params.subAccount.toHexString()
			lost.virtualAccount = vaId
			lost.save()
		}
		let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
		let mt = new MarginTransfer(id)
		mt.type = "EMERGENCY_RECOVER"
		mt.virtualAccount = vaId
		mt.subAccount = event.params.subAccount.toHexString()
		mt.amount = event.params.amount
		mt.source = event.address
		mt.timestamp = event.block.timestamp
		mt.blockNumber = event.block.number
		mt.transaction = event.transaction.hash
		mt.save()
	}
}
