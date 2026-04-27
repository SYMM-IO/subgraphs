import { Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import { DepositHandler } from "./DepositHandler"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"
import { BigInt } from "@graphprotocol/graph-ts"
import { Deposit as Deposit_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { resolveAccountSourceFromAccountLayer } from "../../utils/account_layer_resolver"

export class DepositWithAccountHandler<T> extends DepositHandler<T> {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version)
		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()

		let accountSource = resolveAccountSourceFromAccountLayer(event.address, event.params.user)
		let account = createNewAccountIfNotExists(event.params.user, event.params.user, accountSource, AccountType.UNKNOWN, event.block, event.transaction)
		account.source = event.address
		// v0.8.5 adds an `isVirtual` flag on Deposit. Skip virtual deposits (virtualDepositFor) —
		// no external tokens enter, the Deposit event is reused purely for bookkeeping.
		// `depositFor` keeps isVirtual=false and IS a real external deposit.
		// `internalTransferToBalance` also emits Deposit with isVirtual=false; that path can't be
		// distinguished from the event alone and remains an over-count limitation.
		// Older versions (v0.8.0-v0.8.4) have no isVirtual field — all such emissions are external.
		if (version == Version.v_0_8_5) {
			// @ts-ignore
			let e = changetype<Deposit_0_8_5>(_event)
			if (e.params.isVirtual) {
				account.globalCounter = globalCounter
				account.save()
				return
			}
		}
		if (
			event.transaction.hash.toHexString() == "0xd87280448339c9bec39f98ea17e7371f13562b8b446863db7ee8f4ce53261c71" &&
			event.block.number == BigInt.fromI32(35228647) &&
			event.address.toHexString() == "0xc6a7cc26fd84ae573b705423b7d1831139793025"
		)
			account.deposit = account.deposit.plus(event.params.amount.div(BigInt.fromString("1000000000000")))
		else account.deposit = account.deposit.plus(event.params.amount)

		account.globalCounter = globalCounter
		account.save()
	}
}
