import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../common/BaseHandler"

// v0.8.6 ABI topics. Use only the short execution events: the overloads with
// lockedValues are compatibility duplicates, not additional executions.
const FEE_TOPIC = "0xe65d37f480102fb7565ba751a2179584e61501d6d4e2f7a7232cfd340d3467e7"
const OPEN_TOPIC = "0xa50f98254710514f60327a4e909cd0be099a62f316299907ef997f3dc4d1cda5"
const CLOSE_TOPIC = "0xfa7483d69b899cf16df47cc736ab853f88135f704980d7d358a9746aead7a321"

function feeTagLabel(tag: string): string {
	let bytes = Bytes.fromHexString(tag)
	let end = bytes.length
	while (end > 0 && bytes[end - 1] == 0) end--
	if (end == 0) return tag
	let label = ""
	for (let i = 0; i < end; i++) {
		// Decode printable ASCII labels only; preserve binary tags without data loss.
		if (bytes[i] < 32 || bytes[i] > 126) return tag
		label += String.fromCharCode(bytes[i])
	}
	return label
}

function decodeQuoteId(data: Bytes): BigInt {
	assert(data.length >= 32, "Solver fee metadata: missing quote id")
	let decoded = ethereum.decode("uint256", Bytes.fromUint8Array(data.subarray(0, 32)))
	assert(decoded !== null, "Solver fee metadata: invalid quote id")
	return decoded!.toBigInt()
}

// Read the whole receipt when creating the immutable QuoteEvent. Open fees are
// emitted after OpenPosition; close fees precede FillCloseRequest. Bound the
// search by adjacent executions of this quote to isolate batched partial closes.
export function solverFeeMetadata(event: ethereum.Event, quoteId: BigInt, version: Version, feeType: i32): string | null {
	if (version != Version.v_0_8_6) return null
	assert(feeType == 0 || feeType == 1, "Solver fee metadata: unsupported fee type")
	let receipt = event.receipt
	assert(receipt !== null, "Solver fee metadata: transaction receipt required")
	let logs = receipt!.logs
	let executionTopic = feeType == 0 ? OPEN_TOPIC : CLOSE_TOPIC
	let trigger = -1
	let previous = -1
	let next = logs.length
	for (let i = 0; i < logs.length; i++) {
		let entry = logs[i]
		if (!entry.address.equals(event.address) || entry.topics.length == 0) continue
		if (entry.topics[0].toHexString() != executionTopic) continue
		if (!decodeQuoteId(entry.data).equals(quoteId)) continue
		if (entry.logIndex.equals(event.logIndex)) trigger = i
		else if (entry.logIndex.lt(event.logIndex)) previous = i
		else if (next == logs.length) next = i
	}
	assert(trigger >= 0, "Solver fee metadata: execution missing from receipt")
	let start = feeType == 0 ? trigger + 1 : previous + 1
	let end = feeType == 0 ? next : trigger
	let tags = new Array<string>()
	let amounts = new Array<BigInt>()
	for (let i = start; i < end; i++) {
		let entry = logs[i]
		if (!entry.address.equals(event.address) || entry.topics.length == 0) continue
		if (entry.topics[0].toHexString() != FEE_TOPIC) continue
		assert(entry.topics.length == 4, "Solver fee metadata: invalid fee topics")
		if (!decodeQuoteId(entry.topics[1]).equals(quoteId)) continue
		let decoded = ethereum.decode("(address,address,uint256,uint8,uint256)", entry.data)
		assert(decoded !== null, "Solver fee metadata: invalid fee data")
		let values = decoded!.toTuple()
		if (values[3].toI32() != feeType) continue
		let tag = entry.topics[3].toHexString()
		let amount = values[4].toBigInt()
		let index = tags.indexOf(tag)
		if (index < 0) {
			tags.push(tag)
			amounts.push(amount)
		} else {
			amounts[index] = amounts[index].plus(amount)
		}
	}
	let pairs = new Array<string>()
	for (let i = 0; i < tags.length; i++) {
		let label = feeTagLabel(tags[i]).split("\\").join("\\\\").split('"').join('\\"')
		pairs.push('["' + label + '","' + amounts[i].toString() + '"]')
	}
	return "[" + pairs.join(",") + "]"
}
