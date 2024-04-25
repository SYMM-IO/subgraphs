
import { ChargeFundingRateHandler as CommonChargeFundingRateHandler } from "../../common/handlers/ChargeFundingRateHandler"
import { ChargeFundingRate } from "../../generated/symmio/symmio"

export class ChargeFundingRateHandler extends CommonChargeFundingRateHandler {

  constructor(event: ChargeFundingRate) {
    super(event)
  }

  handle(): void {
    super.handle()
    super.handleQuote()
  }
}
