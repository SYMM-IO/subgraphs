import { AddSymbolHandler as CommonAddSymbolHandler } from "../../common/handlers/AddSymbolHandler"
import { Symbol } from "../../generated/schema"
import { AddSymbol } from "../../generated/symmio/symmio"

export class AddSymbolHandler extends CommonAddSymbolHandler {

    constructor(event: AddSymbol) {
        super(event)
    }

    handle(): void {
        super.handle()
        super.handleGlobalCounter()
        super.handleQuote()
        super.handleSymbol()
        super.handleUser()
        super.handleAccount()

        let event = super.getEvent()
        let symbol = new Symbol(event.params.id.toString())
        symbol.name = event.params.name
        symbol.tradingFee = event.params.tradingFee
        symbol.timestamp = event.block.timestamp
        symbol.updateTimestamp = event.block.timestamp
        symbol.save()
    }
}
