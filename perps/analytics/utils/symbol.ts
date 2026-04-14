import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { Symbol } from "../../../generated/schema"
import { Version } from "../../common/BaseHandler"
import { getSymbolName as getSymbolNameFromContract } from "../../common/VersionedQuoteLoader"

function getSymbolEntityId(symbolId: BigInt, source: Address): string {
	return symbolId.toString() + "-" + source.toHexString()
}

export function resolveSymbolName(version: Version, symbolId: BigInt, source: Address): string {
	let symbol = Symbol.load(getSymbolEntityId(symbolId, source))
	if (symbol) return symbol.name

	let symbolName = getSymbolNameFromContract(version, symbolId, source)
	if (symbolName.length > 0) return symbolName

	log.warning("Failed to resolve symbol name for symbol {} at source {}", [symbolId.toString(), source.toHexString()])
	return ""
}
