import { BigInt, Bytes } from "@graphprotocol/graph-ts"

export const SYMMIO_SHARE_DEFAULT = BigInt.fromI32(40)

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
export const ZERO_ADDRESS_BYTES = Bytes.fromHexString(ZERO_ADDRESS)

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
rolesNames.set("0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08", "MANAGER_ROLE")

export function getRoleName(key: string): string {
	if (rolesNames.has(key)) return rolesNames.get(key)
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
	LIQUIDATED_PENDING,
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
	BRIDGE,
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
balanceChangeTypes.set(BalanceChangeType.BRIDGE, "BRIDGE")

export const SOLVERS = new Map<string, string>()
// arbitrum
SOLVERS.set("0x00c069d68bc7420740460dbc3cc3fff9b3742421", "PerpsHub")
SOLVERS.set("0x7d387771f6e23f353a4afce21af521875c0825d0", "PerpsHub")
SOLVERS.set("0xdb91d232e93969130272de309d3d914547604426", "PerpsHub")
// mantle
SOLVERS.set("0x12de0352dd4187af5797f5147c4179f9624346e2", "PerpsHub")
SOLVERS.set("0x614bb1f3e0ae5a393979468ed89088f05277312c", "PerpsHub")
SOLVERS.set("0xf9e39b4b30e26c18d2a725c0397ed5a925efe46b", "PerpsHub")
SOLVERS.set("0x50e88c692b137b8a51b6017026ef414651e0d5ba", "Rasa")
SOLVERS.set("0x8c6641e23143718419829e709f093ee6ec922537", "Zenith")
// bnb
SOLVERS.set("0xd5a075c88a4188d666fa1e4051913be6782982da", "PerpsHub")
SOLVERS.set("0xdf077f5f52bc41a9072f9d0e5fb281770bcd1142", "PerpsHub")
SOLVERS.set("0xdfed11fe4af63b059edbbdf53e9c633b331ed432", "PerpsHub")
SOLVERS.set("0x9fa01a45e245015fa685f21763e60c60832ed2d6", "Rasa")
SOLVERS.set("0x6d1d09586a274517c5a089364a93c02b6b261990", "Zenith")
SOLVERS.set("0xd5e4b5928d99e7afbea497a301ca5fa2e752b101", "Zenith")
// base
SOLVERS.set("0x12de0352dd4187af5797f5147c4179f9624346e2", "PerpsHub")
SOLVERS.set("0x1ecabf0eba136920677c9575faccee36f30592cf", "PerpsHub")
SOLVERS.set("0xfc4ac3af357ebe6d556dcd72453e9b30f6dc6873", "PerpsHub")
SOLVERS.set("0xb6e3b44975f2966707a91747f89d2002ff8d62db", "PerpsHub")
SOLVERS.set("0x9206d9d8f7f1b212a4183827d20de32af3a23c59", "Rasa")
SOLVERS.set("0x5f3525db7589640dae87d6040a85c49fa43feb2f", "Zenith")
SOLVERS.set("0x94d2c48821f7667923d7656acc3529b953b40d09", "Zenith")
SOLVERS.set("0xf49d008921de3cbe9eefb6c2f781cb804d7945f7", "Rasa-NoHedge")
SOLVERS.set("0x15c544d6a630b88b45cb699522da20b7fda1ea89", "Rasa-Meme")
SOLVERS.set("0xb49cae38c96f6425ce4a46e8220549c6a13362be", "Intentx")
SOLVERS.set("0xecd1d9dc751316831d893b1ab3ef0d36392b20db", "Superflow")
SOLVERS.set("0x6651f6047e45a68b59aac3b3ebe60a8d65b9c4d9", "Superflow")
SOLVERS.set("0x939ca7b7de3be50b537bfb59586c20cbe724570b", "Orbs")
// bera
SOLVERS.set("0xdfed11fe4af63b059edbbdf53e9c633b331ed432", "PerpsHub")
SOLVERS.set("0x78b1b8134a4236e69ae3728691e90b31f02c3001", "PerpsHub")
SOLVERS.set("0x8141c1840f7d190cd24239c22b1e560e08999b12", "PerpsHub")
// mode
SOLVERS.set("0x87fc464fa528260f1eeab94fa20f73fed8536eb7", "PerpsHub")
SOLVERS.set("0x7d387771f6e23f353a4afce21af521875c0825d0", "PerpsHub")
SOLVERS.set("0x78e76ac7fec050ca785c19ffaddf57137b890543", "PerpsHub")
// sonic
SOLVERS.set("0x7d387771f6e23f353a4afce21af521875c0825d0", "Orbs")
SOLVERS.set("0xf25f5aab4e26e75c09ac665c66943ac11b48ae4c", "Orbs")
SOLVERS.set("0x8141c1840f7d190cd24239c22b1e560e08999b12", "Orbs")
// polygon
SOLVERS.set("0xf339ac42c861be13170cf89998b7f62ed230069a", "Rasa-NoHedge")
SOLVERS.set("0x5044238ea045585c704dc2c6387d66d29ed56648", "Rasa")
SOLVERS.set("0x7afa216c2ba5cd4d749fea61db6fe4b596ec9bee", "Rasa")
SOLVERS.set("0x3b5ac601c7bb74999ab3135fa43cbdbc6ab74570", "Orbs")
SOLVERS.set("0xaed9e4568da7140bdcc23a57c8448cd894d7df4a", "Orbs")
SOLVERS.set("0x3239c8043f1035c9a32f12a962183e07c2bd2fec", "Orbs")
SOLVERS.set("0x293a276ab8e6550f8c8aa192a2c4b1215144d943", "Orbs")
SOLVERS.set("0x94d2c48821f7667923d7656acc3529b953b40d09", "Orbs")
SOLVERS.set("0x1bdff5940ebd182ed217bf2ff380caf4db4eac91", "Orbs")
SOLVERS.set("0x63fab7819459fb6f09d3d3f4a86a17f1d29e0798", "Orbs")
SOLVERS.set("0x53d9ddce4bc6cd9bb7c96ff064fa0e366e965b18", "Orbs")
SOLVERS.set("0x880ed0d338793ca7595306491d665585c22659cf", "Orbs")
// blast
SOLVERS.set("0xecbd0788bb5a72f9dfdac1ffeaaf9b7c2b26e456", "Rasa")

export const AFFILIATES = new Map<string, string>()
AFFILIATES.set(ZERO_ADDRESS, "Unknown")
// arbitrum
AFFILIATES.set("0x6273242a7e88b3de90822b31648c212215caafe4", "Pear")
AFFILIATES.set("0x3334226b27fcdda639620ee10c4dfca30f084969", "Vibe")
AFFILIATES.set("0x141269e29a770644c34e05b127ab621511f20109", "IntentX")
AFFILIATES.set("0x263a8220e9351c5d0cc13567db4d7bf58e7470c6", "Horizon")
AFFILIATES.set("0xb27691603361c87af0f02dbd88ff569207810346", "Gryps")
// mantle
AFFILIATES.set("0xecbd0788bb5a72f9dfdac1ffeaaf9b7c2b26e456", "IntentX")
// bnb
AFFILIATES.set("0x650a2d6c263a93cff5edd41f836ce832f05a1cf3", "AlphaThena")
AFFILIATES.set("0x058ba7574d8bc66f1a1dcc44bb5b18894d4190e0", "AlphaThena")
AFFILIATES.set("0x10acc15db0d432280be4885dae65e1cc76da3c54", "Cloverfield")
AFFILIATES.set("0x75c539efb5300234e5daa684502735fc3886e8b4", "AlphaThena")
AFFILIATES.set("0x041e372ed328a6088e470476e6df92617a86e2b2", "AlphaThena")
AFFILIATES.set("0x4986415e243b9db258124909facb0a6aa87f6ccd", "AlphaThena")
AFFILIATES.set("0x723abb2ef943d816a010f6f2ed510e513cc0d7f3", "AlphaThena")
AFFILIATES.set("0xdaa571297038eecb31dcafc3d1ff2c1a138e41c9", "AlphaThena")
AFFILIATES.set("0xf3d56c3c1e610581181f4de9242dbda92d583dd6", "AlphaThena")
AFFILIATES.set("0x49f49005e8e4d333459a05ccd34d00eb30d67446", "AlphaThena")
AFFILIATES.set("0x2035cac2c606c66e0b650f6e102bfaf931218432", "AlphaThena")
AFFILIATES.set("0xbcc250b8d7e7e378c85fe9bc83ff0eff5d5b0f20", "AlphaThena")
AFFILIATES.set("0x7634fd3084286e15de973eca9a56dd353dab3ee3", "AlphaThena")
AFFILIATES.set("0xefd638a013bf62638efb4a405aca804f5f7d6cb8", "AlphaThena")
AFFILIATES.set("0xccc8cc82868b94bc2759c69375fc7ae769703eb8", "Cloverfield")
// base
AFFILIATES.set("0xc6ecf3ab3d09ba6f1565ad6e139b5d3ba30bb774", "Befi")
AFFILIATES.set("0x6d63921d8203044f6abad8f346d3aea9a2719ddd", "BMX")
AFFILIATES.set("0x8ab178c07184ffd44f0adff4ea2ce6cfc33f3b86", "IntentX")
AFFILIATES.set("0x1c03b6480a4efc2d4123ba90d7857f0e1878b780", "Based")
AFFILIATES.set("0x95605c64356572eb5c076cb9c027c88b527a2059", "Vibe")
AFFILIATES.set("0xf7f56d7e02d5c7bf33525ae2eecb049a17ef4580", "Cloverfield")
AFFILIATES.set("0x921dd892d67aed3d492f9ad77b30b60160b53fe1", "Privex")
AFFILIATES.set("0xdfc2a55a44ad3d3aabfe8d1c498ea923c6d39526", "Peppy")
AFFILIATES.set("0xf2215724516a564efc5b3f1f77a7d5f8770a58ef", "ZkLink")
AFFILIATES.set("0xb49cae38c96f6425ce4a46e8220549c6a13362be", "Intentx")
AFFILIATES.set("0xde6446197cd1ae02e1c5b7191a626fb0c1757377", "Xpanse")
AFFILIATES.set("0x39ecc772f6073242d6fd1646d81fa2d87fe95314", "Carbon")
AFFILIATES.set("0xe43166ce17d3511b09438a359daa53513225101d", "Pear")
AFFILIATES.set("0x0b4779a37c5e6cd7060cc265105ff44a03b47b26", "QuickSwap")
AFFILIATES.set("0x72b03e85b40a745b07f3a15e7a02e66f7f8352f3", "Treble")
AFFILIATES.set("0x95605c64356572eb5c076cb9c027c88b527a2059", "Vibe")
AFFILIATES.set("0x96cb0251d67ea2a3e6a1e5b7b41f7cd63d6c530f", "Vibe")
AFFILIATES.set("0x5de6949717f3aa8e0fbed5ce8b611ebcf1e44ae9", "Based")
AFFILIATES.set("0x724796d2e9143920b1b58651b04e1ed201b8cc98", "IntentX")
AFFILIATES.set("0x8a98f69139534ef85775b473082ce4af1373cd63", "Vibe")
// bera
AFFILIATES.set("0x5c9fc09b120b7333f1dcf644c7665cedea3dc7e2", "IVX")
AFFILIATES.set("0x703c4927945aac2b5a76f4c1d85bc85e6faaddb6", "Lode")
// mode
AFFILIATES.set("0x3adc81cc43d9e1636de9cbac764afcb1f3ae6cde", "Cloverfield")
AFFILIATES.set("0xc0ff4b56f62f20ba45f4229cc6baad986fa2a904", "BMX")
AFFILIATES.set("0xde6446197cd1ae02e1c5b7191a626fb0c1757377", "Horizon")
// sonic
AFFILIATES.set("0xd90aca50ee8cb7c3dd1fee84a722d574186cdd17", "Spooky")
// polygon
AFFILIATES.set("0xffe2c25404525d2d4351d75177b92f18d9daf4af", "Cloverfield")
AFFILIATES.set("0x53c3923ef2e64a2a259b2ac6f140deaa1ac59f64", "Vibe")
AFFILIATES.set("0xc362b32af10b28ef775c429d26f6143d143a6e60", "Vibe")
// blast
AFFILIATES.set("0x083267d20dbe6c2b0a83bd0e601dc2299ed99015", "IntentX")
AFFILIATES.set("0xd6ee1fd75d11989e57b57aa6fd75f558fbf02a5e", "Core")

export const LIQUIDATORS = [
	// mantle
	"0xacd9623cd291ee157db752a2f599ca7a0e3604e2",
	"0xcfc8a928bec0950f0c56c6ff0b186d0d8afcf89b",
	"0xe795a9fca009272ae5115b335f3eac5d50f7a80f",
	"0x9c2de6272de9ab37ae4b7c5ed2819cb80c23f0e8",
	"0xbed72b856f56533e3e9a483535a7f46bf62855a1",
	"0x801b2f9e59040bd86bb7eac4b17d1f985774c150",
	"0xefaf1f4e73c1a0ce62892eeeb75e553a185f5a6d",
	"0xa967618730fb6ff67427a32e5cec2e3b23f1f9ef",
	// bnb
	"0xeeb70bfe8e879e9e8fbd9501199db82e5eeb697e",
	"0x77e58cbc7f4afd08e8e2c880ab38a98c42abce36",
	"0xe8cf3b7ed0eb925943407a97ba904647ad6dfdc6",
	"0x97c955604872f03ae7fed0fe47ebbee715c5e8f1",
	// base
	"0xb2679343c6068cc566d32a6d52f0573723b1de1d",
	"0xcf8739af3fd1f2a4a3b6bf68c44dbefd0da5712c",
	"0x75c221d2b768bfd56008995e2f496c49cb7adc7a",
	"0xd130f10cf0182c32d011a498aca7bb33dd05ac77",
	"0x153a3c4e079772eda818b9966f9830c68edea6d1",
	"0x31e4e68bad414547ad5c7bf2997a8d90c986875e",
	"0x1fdc2223d812f136d86fd6b8426f890bd1531050",
	"0x6f2f120bd82ca911a3221f228e768248bf93e8f4",
	// bera
	"0xaf3e73934137e0d749e349e3788d3cea0348c52b",
	"0x190d70e3ebe0f4051a4dff8a4a5de1cf02ee0091",
	"0xb1b421e1e6edf6f94e055080a7b78407fc4d158d",
	"0xba65a64eba90e1d65f128f4586bc7ea8564a0d64",
	"0x0e07b1c30cdd9099feacac8132cdd0dc38914b86",
	"0xdc59a81fa1fc3da81a17c1b9a4f911f641fa5606",
	// polygon
	"0xb2679343c6068cc566d32a6d52f0573723b1de1d",
	"0xcf8739af3fd1f2a4a3b6bf68c44dbefd0da5712c",
	"0x75c221d2b768bfd56008995e2f496c49cb7adc7a",
	"0xd130f10cf0182c32d011a498aca7bb33dd05ac77",
	// blast
	"0xa4f4687b6375d34990a31ba0fa2e57e0e9966462",
	"0x88815411144855049dfd3fb3be88290576d5ad88",
	"0x03b263078a47cb20beb46e2db41e3bc639d71e4f",
	"0xd5f626ca164d248b3320ab98db0df8e1882f21ee",
]
