import { ApprovalHandler } from "../handlers/symm_token/ApprovalHandler"
import { Approval, Transfer } from "../../generated/symm_token_1/symm_token_1"
import { TransferHandler } from "../handlers/symm_token/TransferHandler"
import { SymmTokenVersion } from "../../common/BaseHandler"

export function handleApproval(event: Approval): void {
	let handler = new ApprovalHandler<Approval>()
	handler.handle(event, SymmTokenVersion.v_1)
}

export function handleTransfer(event: Transfer): void {
	let handler = new TransferHandler<Transfer>()
	handler.handle(event, SymmTokenVersion.v_1)
}
