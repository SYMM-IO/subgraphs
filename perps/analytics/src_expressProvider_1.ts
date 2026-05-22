import { BadDebtAccruedHandler } from "./handlers/expressProvider/BadDebtAccruedHandler"
import { CreditBadDebtRepaidHandler } from "./handlers/expressProvider/CreditBadDebtRepaidHandler"
import { DebtActivatedHandler } from "./handlers/expressProvider/DebtActivatedHandler"
import { DebtCancelledHandler } from "./handlers/expressProvider/DebtCancelledHandler"
import { DebtReservedHandler } from "./handlers/expressProvider/DebtReservedHandler"
import { DebtSettledHandler } from "./handlers/expressProvider/DebtSettledHandler"
import { RequestDebtClearedHandler } from "./handlers/expressProvider/RequestDebtClearedHandler"
import { ensureSyncMeta } from "./src_sync_meta"
import { ExpressProviderVersion } from "../common/BaseHandler"
import {
	BadDebtAccrued,
	CreditBadDebtRepaid,
	DebtActivated,
	DebtCancelled,
	DebtReserved,
	DebtSettled,
	RequestDebtCleared,
} from "../../generated/templates/ExpressProvider/expressProvider_1"

export function handleBadDebtAccrued(event: BadDebtAccrued): void {
	ensureSyncMeta(event.block)
	let handler = new BadDebtAccruedHandler<BadDebtAccrued>()
	handler.handle(event, ExpressProviderVersion.v_1)
}

export function handleCreditBadDebtRepaid(event: CreditBadDebtRepaid): void {
	ensureSyncMeta(event.block)
	let handler = new CreditBadDebtRepaidHandler<CreditBadDebtRepaid>()
	handler.handle(event, ExpressProviderVersion.v_1)
}

export function handleDebtActivated(event: DebtActivated): void {
	ensureSyncMeta(event.block)
	let handler = new DebtActivatedHandler<DebtActivated>()
	handler.handle(event, ExpressProviderVersion.v_1)
}

export function handleDebtCancelled(event: DebtCancelled): void {
	ensureSyncMeta(event.block)
	let handler = new DebtCancelledHandler<DebtCancelled>()
	handler.handle(event, ExpressProviderVersion.v_1)
}

export function handleDebtReserved(event: DebtReserved): void {
	ensureSyncMeta(event.block)
	let handler = new DebtReservedHandler<DebtReserved>()
	handler.handle(event, ExpressProviderVersion.v_1)
}

export function handleDebtSettled(event: DebtSettled): void {
	ensureSyncMeta(event.block)
	let handler = new DebtSettledHandler<DebtSettled>()
	handler.handle(event, ExpressProviderVersion.v_1)
}

export function handleRequestDebtCleared(event: RequestDebtCleared): void {
	ensureSyncMeta(event.block)
	let handler = new RequestDebtClearedHandler<RequestDebtCleared>()
	handler.handle(event, ExpressProviderVersion.v_1)
}
