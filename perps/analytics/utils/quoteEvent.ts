import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { QuoteEvent } from "../../../generated/schema"

export class JSONBuilder {
	private pairs: string[] = []

	add(key: string, value: string): JSONBuilder {
		this.pairs.push('"' + key + '":"' + value + '"')
		return this
	}

	addNullable(key: string, value: string | null): JSONBuilder {
		if (value !== null) {
			this.pairs.push('"' + key + '":"' + value + '"')
		}
		return this
	}

	build(): string {
		return "{" + this.pairs.join(",") + "}"
	}
}

export function createQuoteEvent(
	event: ethereum.Event,
	quoteId: BigInt,
	type: string,
	metadata: string | null,
): void {
	let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + quoteId.toString()
	let entity = new QuoteEvent(id)
	entity.source = event.address
	entity.quoteId = quoteId
	entity.quote = quoteId.toString() + "-" + event.address.toHexString()
	entity.type = type
	entity.metadata = metadata
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}
