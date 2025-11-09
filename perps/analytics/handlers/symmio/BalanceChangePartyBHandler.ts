import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { BalanceChange, CvaLf } from "../../../../generated/schema";
import { BalanceChangePartyB } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { getConfiguration } from "../../utils/builders"
import { balanceChangeTypes } from "../../utils/constants"

export class BalanceChangePartyBHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<BalanceChangePartyB>(_event)
		let bc = new BalanceChange(event.transaction.hash.toHex() + "-" + event.logIndex.toHexString())
		bc.source = event.address
		bc.amount = event.params.amount
		bc.account = event.params.partyB
		bc.sideAccount = event.params.partyA
		bc.type = balanceChangeTypes.get(event.params._type)
		bc.collateral = getConfiguration(event).collateral
		bc.timestamp = event.block.timestamp
		bc.blockNumber = event.block.number
		bc.transaction = event.transaction.hash
		bc.save()
		if (event.params._type == 6 || event.params._type == 8) {
			let cvaLf = CvaLf.load(event.transaction.hash.toHex() + "-" + event.params._type.toString())
			if (!cvaLf) {
				cvaLf = new CvaLf(event.transaction.hash.toHex() + "-" + event.params._type.toString())
				cvaLf.source = event.address
				cvaLf.account = event.params.partyB
				cvaLf.sideAccount = event.params.partyA
				cvaLf.type = balanceChangeTypes.get(event.params._type)
				cvaLf.amount = BigInt.zero()
				cvaLf.timestamp = event.block.timestamp
				cvaLf.blockNumber = event.block.number
				cvaLf.transaction = event.transaction.hash
			}
			cvaLf.amount = cvaLf.amount.plus(event.params.amount)
			cvaLf.save()
		}
	}
}
