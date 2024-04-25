
import { LockQuoteHandler as CommonLockQuoteHandler } from "../../common/handlers/LockQuoteHandler"
import { LockQuote } from "../../generated/symmio/symmio"

export class LockQuoteHandler extends CommonLockQuoteHandler {

  constructor(event: LockQuote) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleQuote()
  }
}
