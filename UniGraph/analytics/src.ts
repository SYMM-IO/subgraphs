
import {UnlockQuoteHandler} from "./handlers/UnlockQuoteHandler"
import {UnlockQuote} from "../generated/symmio/symmio"
		
import {SendQuoteHandler} from "./handlers/SendQuoteHandler"
import {SendQuote} from "../generated/symmio/symmio"
		
import {LockQuoteHandler} from "./handlers/LockQuoteHandler"
import {LockQuote} from "../generated/symmio/symmio"
		
export function handleUnlockQuote(event: UnlockQuote): void {
	let handler = new UnlockQuoteHandler(event)
	handler.handle()
}
		
export function handleSendQuote(event: SendQuote): void {
	let handler = new SendQuoteHandler(event)
	handler.handle()
}
		
export function handleLockQuote(event: LockQuote): void {
	let handler = new LockQuoteHandler(event)
	handler.handle()
}
		