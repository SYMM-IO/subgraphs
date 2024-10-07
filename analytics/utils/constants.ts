// @ts-ignore
let rolesNames = new Map<string, string>()
rolesNames.set("0x1effbbff9c66c5e59634f24fe842750c60d18891155c32dd155fc2d661a4c86d", "DEFAULT_ADMIN_ROLE")
rolesNames.set("0x0000000000000000000000000000000000000000000000000000000000000000", "DEFAULT_ADMIN_ROLE")
rolesNames.set("0xb048589f9ee6ae43a7d6093c04bc48fc93d622d76009b51a2c566fc7cda84ce7", "MUON_SETTER_ROLE")
rolesNames.set("0xddf732565ddd4d1d3a527786b8b1e425a602b603d457c0a999938869f38049b0", "SYMBOL_MANAGER_ROLE")
rolesNames.set("0x61c92169ef077349011ff0b1383c894d86c5f0b41d986366b58a6cf31e93beda", "SETTER_ROLE")
rolesNames.set("0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a", "PAUSER_ROLE")
rolesNames.set("0x427da25fe773164f88948d3e215c94b6554e2ed5e5f203a821c9f2f6131cf75a", "UNPAUSER_ROLE")
rolesNames.set("0x23288e74cb14deb13fd69e749986e8975f19aa3efb14b2fe5e9b512d772f19b3", "PARTY_B_MANAGER_ROLE")
rolesNames.set("0x5e17fc5225d4a099df75359ce1f405503ca79498a8dc46a7d583235a0ee45c16", "LIQUIDATOR_ROLE")
rolesNames.set("0x905e7c6bceabadb31a2ebbb666d0d6df4dfb3156f376c424680851d38988ea84", "SUSPENDER_ROLE")
rolesNames.set("0xc785f0e55c16138ca0f8448186fa6229be092a3a83db3c5d63c9286723c5a2c4", "DISPUTE_ROLE")
rolesNames.set("0x931c8e73074924ecdce1f1602777505305e234e4ae359fdf7ed84d5fd0cfdbee", "AFFILIATE_MANAGER_ROLE")
rolesNames.set("0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a", "PAUSER_ROLE")
rolesNames.set("0x61c92169ef077349011ff0b1383c894d86c5f0b41d986366b58a6cf31e93beda", "SETTER_ROLE")
rolesNames.set("0x427da25fe773164f88948d3e215c94b6554e2ed5e5f203a821c9f2f6131cf75a", "UNPAUSER_ROLE")
rolesNames.set("0x0000000000000000000000000000000000000000000000000000000000000000", "DEFAULT_ADMIN_ROLE")

export function getRoleName(key: string): string {
	if (rolesNames.has(key))
		return rolesNames.get(key)
	return key
}

export enum QuoteStatus {
	PENDING,
	LOCKED,
	CANCEL_PENDING,
	CANCELED,
	OPENED,
	CLOSE_PENDING,
	CANCEL_CLOSE_PENDING,
	CLOSED,
	LIQUIDATED,
	EXPIRED,
}

export enum BalanceChangeType {
	ALLOCATE,
	DEALLOCATE,
	PLATFORM_FEE_IN,
	PLATFORM_FEE_OUT,
	REALIZED_PNL_IN,
	REALIZED_PNL_OUT,
	CVA_IN,
	CVA_OUT,
	LF_IN,
	LF_OUT,
	DEPOSIT,
	WITHDRAW,
}
// @ts-ignore
export let balanceChangeTypes = new Map<number, string>()
balanceChangeTypes.set(BalanceChangeType.ALLOCATE, "ALLOCATE")
balanceChangeTypes.set(BalanceChangeType.DEALLOCATE, "DEALLOCATE")
balanceChangeTypes.set(BalanceChangeType.PLATFORM_FEE_IN, "PLATFORM_FEE_IN")
balanceChangeTypes.set(BalanceChangeType.PLATFORM_FEE_OUT, "PLATFORM_FEE_OUT")
balanceChangeTypes.set(BalanceChangeType.REALIZED_PNL_IN, "REALIZED_PNL_IN")
balanceChangeTypes.set(BalanceChangeType.REALIZED_PNL_OUT, "REALIZED_PNL_OUT")
balanceChangeTypes.set(BalanceChangeType.CVA_IN, "CVA_IN")
balanceChangeTypes.set(BalanceChangeType.CVA_OUT, "CVA_OUT")
balanceChangeTypes.set(BalanceChangeType.LF_IN, "LF_IN")
balanceChangeTypes.set(BalanceChangeType.LF_OUT, "LF_OUT")
balanceChangeTypes.set(BalanceChangeType.DEPOSIT, "DEPOSIT")
balanceChangeTypes.set(BalanceChangeType.WITHDRAW, "WITHDRAW")
