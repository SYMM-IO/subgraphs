import { ethereum } from "@graphprotocol/graph-ts"
import { BaseAccountLayerHandler, AccountLayerVersion } from "../../BaseHandler"
import { getGlobalCounterAndInc } from "../../utils"
import { MarginTransfer, SubAccount, VirtualAccount } from "../../../../generated/schema"
import { coreSourceForAccountLayer, setMarginTransferProfileSources } from "../../utils/profile"
import { BigInt } from "@graphprotocol/graph-ts"
import { updateMarginHierarchyHistories } from "../../../analytics/utils/historyHelpers"
import { refreshAccountLayerMarginLatestBalances } from "../../utils/accountLayerMarginBalances"

export class AddMarginHandler<T> extends BaseAccountLayerHandler {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
		let mt = new MarginTransfer(id)
		mt.globalCounter = getGlobalCounterAndInc()
		let coreSource = coreSourceForAccountLayer(event.address)
		mt.type = "ADD"
		mt.virtualAccount = event.params.virtualAccount.toHexString()
		mt.subAccount = event.params.subAccount.toHexString()
		mt.amount = event.params.amount
		mt.source = event.address
		setMarginTransferProfileSources(mt, event.address, coreSource, event.address)
		mt.timestamp = event.block.timestamp
		mt.blockNumber = event.block.number
		mt.transaction = event.transaction.hash
		mt.save()
		let sub = SubAccount.load(mt.subAccount)
		if (sub) {
			sub.lastMarginTransferTimestamp = event.block.timestamp
			sub.latestMarginBalance = (sub.latestMarginBalance === null ? BigInt.zero() : sub.latestMarginBalance!).plus(event.params.amount)
			sub.save()
		}
		let va = VirtualAccount.load(mt.virtualAccount)
		if (va) {
			va.lastMarginTransferTimestamp = event.block.timestamp
			va.latestMarginBalance = (va.latestMarginBalance === null ? BigInt.zero() : va.latestMarginBalance!).plus(event.params.amount)
			va.save()
		}
		if (sub) {
			updateMarginHierarchyHistories(sub, va, event.block.timestamp, event.params.amount, BigInt.zero())
		}
		refreshAccountLayerMarginLatestBalances(event, coreSource, event.params.subAccount, event.params.virtualAccount)
	}
}
