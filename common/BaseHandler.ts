import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {getGlobalCounterAndInc} from "./utils"

export enum Version {
	v_0_8_0,
	v_0_8_1,
	v_0_8_2,
	v_0_8_3,
	v_0_8_4
}

export enum VaultVersion {
	v_1,
}

export enum VaultTokenVersion {
	v_1,
}

export enum MultiAccountVersion {
	v_1,
}

export enum TimelockVersion {
	v_1,
}

export class BaseHandler {

	constructor() {
	}

	handle(_event: ethereum.Event, version: Version): void {
	}

	handleQuote(_event: ethereum.Event, version: Version): void {
	}

	handleAccount(_event: ethereum.Event, version: Version): void {
	}

	handleSymbol(_event: ethereum.Event, version: Version): void {
	}

	handleGlobalCounter(): BigInt {
		return getGlobalCounterAndInc()
	}
}

export class BaseMultiAccountHandler {

	constructor() {
	}

	handle(_event: ethereum.Event, version: MultiAccountVersion): void {
	}

	handleAccount(_event: ethereum.Event, version: MultiAccountVersion): void {
	}

	handleGlobalCounter(): BigInt {
		return getGlobalCounterAndInc()
	}
}