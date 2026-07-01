import { readFileSync } from "node:fs"
import { test } from "node:test"
import assert from "node:assert/strict"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("analytics schema exposes raw affiliate express withdraw components only", () => {
  const schema = read("perps/analytics/schema.graphql")

  assert.match(schema, /type AffiliateExpressWithdrawComponents @entity\(immutable: false\)/)
  assert.match(schema, /type AffiliateExpressWithdrawComponentBucket @entity\(immutable: false\)/)
  assert.match(schema, /type AffiliateExpressWithdrawAccountSnapshot @entity\(immutable: false\)/)

  for (const field of [
    "freeBalance18",
    "allocatedBalance18",
    "pendingWithdrawAmountCollateral",
    "pendingExpressWithdrawAmountCollateral",
    "pendingVirtualWithdrawAmountCollateral",
    "advancedWithdrawAmountCollateral",
    "advancedWithdrawDataAvailable",
    "reservedDebtCollateral",
    "activeDebtCollateral",
    "badDebtCollateral",
    "debtDataAvailable",
    "reservedDebtAmount",
    "activeDebtAmount",
    "badDebtAmount",
    "brokenHierarchyCount",
    "unresolvedLegacyAccountCount",
  ]) {
    assert.match(schema, new RegExp(`${field}: (BigInt|Boolean)!`), `missing ${field}`)
  }

  assert.doesNotMatch(schema, /eligibleBase/i)
  assert.doesNotMatch(schema, /conservative/i)
  assert.doesNotMatch(schema, /isSafe/i)
})

test("core withdraw request events feed aggregate component fields", () => {
  const schema = read("perps/analytics/schema.graphql")
  const deps085 = read("perps/analytics/deps_symmio_0_8_5.json")
  const deps086 = read("perps/analytics/deps_symmio_0_8_6.json")
  const abi085 = read("configs/abis/symmio_0_8_5.json")
  const abi086 = read("configs/abis/symmio_0_8_6.json")
  const withdrawInitiated = read("perps/analytics/handlers/symmio/WithdrawInitiatedHandler.ts")
  const withdrawFinalized = read("perps/analytics/handlers/symmio/WithdrawFinalizedHandler.ts")
  const withdrawAdvanced = read("perps/analytics/handlers/symmio/WithdrawAdvancedHandler.ts")
  const registerProvider = read("perps/analytics/handlers/symmio/RegisterExpressProviderHandler.ts")
  const src086 = read("perps/analytics/src_symmio_0_8_6.ts")

  for (const field of [
    "classicAmount: BigInt!",
    "expressAmount: BigInt!",
    "virtualAmount: BigInt!",
    "advancedAmount: BigInt!",
    "reservedDebtAmount: BigInt!",
    "activeDebtAmount: BigInt!",
    "badDebtAmount: BigInt!",
  ]) {
    assert.match(schema, new RegExp(field.replace(/[!*]/g, "\\$&")), `WithdrawRequest missing ${field}`)
  }
  assert.match(schema, /type WithdrawRequestAccountLookup @entity\(immutable: false\)/)

  assert.doesNotMatch(abi085, /"WithdrawAdvanced"/)
  assert.doesNotMatch(deps085, /"WithdrawAdvanced"/)
  assert.match(abi086, /"WithdrawAdvanced"/)
  assert.match(abi086, /"RegisterExpressProvider"/)
  assert.match(deps086, /"WithdrawAdvanced"/)
  assert.match(deps086, /"RegisterExpressProvider"/)
  assert.match(deps085, /"WithdrawRequestAccountLookup"/)
  assert.match(withdrawInitiated, /applyWithdrawRequestToAffiliateExpressWithdrawComponents/)
  assert.match(withdrawInitiated, /reservedDebtAmount = BigInt\.zero\(\)/)
  assert.match(withdrawFinalized, /removeWithdrawRequestFromAffiliateExpressWithdrawComponents/)
  assert.match(withdrawAdvanced, /recordWithdrawAdvanced/)
  assert.match(registerProvider, /ExpressProvider\.create/)
  assert.match(src086, /Version\.v_0_8_6/)
  assert.match(read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts"), /sourceHasAdvancedWithdrawData/)

  const helper = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts")
  const removeStart = helper.indexOf("export function removeWithdrawRequestFromAffiliateExpressWithdrawComponents")
  const advancedStart = helper.indexOf("export function applyWithdrawAdvancedToAffiliateExpressWithdrawComponents")
  assert.notEqual(removeStart, -1, "missing terminal withdraw removal helper")
  assert.notEqual(advancedStart, -1, "missing advanced withdraw helper")
  const removeHelper = helper.slice(removeStart, advancedStart)
  assert.doesNotMatch(removeHelper, /applyWithdrawRequestDelta/, "terminal removal must use stored component refs only")

  const virtualBranch = withdrawInitiated.indexOf("if (isVirtual)")
  const expressBranch = withdrawInitiated.indexOf("} else if (isExpress)")
  assert.notEqual(virtualBranch, -1, "withdraw parts must classify virtual-provider amounts")
  assert.notEqual(expressBranch, -1, "withdraw parts must classify express-provider amounts")
  assert.ok(virtualBranch < expressBranch, "virtual-provider amounts must not also count as express pending withdraws")
})

test("provider debt events feed raw aggregate debt fields through a dynamic template", () => {
  const providerAbi = read("configs/abis/expressProvider_1.json")
  const providerDeps = read("perps/analytics/deps_expressProvider_1.json")
  const src = read("perps/analytics/src_expressProvider_1.ts")
  const helper = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts")
  const manager = read("scripts/manager.py")
  const hyperevmMainnet = read("configs/perps/hyperevm.json")
  const arbitrum = read("configs/perps/arbitrum.json")

  for (const eventName of [
    "DebtReserved",
    "DebtActivated",
    "DebtSettled",
    "DebtCancelled",
    "BadDebtAccrued",
    "RequestDebtCleared",
    "CreditBadDebtRepaid",
  ]) {
    assert.match(providerAbi, new RegExp(`"name": "${eventName}"`), `provider ABI missing ${eventName}`)
    assert.match(providerDeps, new RegExp(`"${eventName}"`), `provider deps missing ${eventName}`)
    assert.match(src, new RegExp(`handle${eventName}`), `provider src missing handler for ${eventName}`)
  }

  assert.match(helper, /try_symmio\(\)/)
  assert.match(helper, /try_collateral\(\)/)
  assert.match(helper, /recordReservedCreditLineDebt/)
  assert.match(helper, /recordActivatedCreditLineDebt/)
  assert.match(helper, /recordRepaidBadCreditLineDebt/)
  assert.match(manager, /generated\/templates\/\{template_name\}/)
  assert.match(manager, /"templates": \[\]/)
  assert.doesNotMatch(hyperevmMainnet, /"version": "0_8_6"/)
  assert.match(arbitrum, /"version": "0_8_6"/)
})

test("balance updates are aggregated by account classification without publishing a formula", () => {
  const helper = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts")
  const latestBalance = read("perps/analytics/utils/latestAccountBalance.ts")
  const subCreated = read("perps/analytics/handlers/accountLayer/SubAccountCreatedHandler.ts")
  const legacyImported = read("perps/analytics/handlers/accountLayer/LegacyAccountImportedHandler.ts")
  const virtualCreated = read("perps/analytics/handlers/accountLayer/VirtualAccountCreatedHandler.ts")
  const multiAccountAdded = read("perps/analytics/handlers/symmioMultiAccount/AddAccountHandler.ts")
  const commonMultiAccountAdded = read("perps/common/handlers/symmioMultiAccount/AddAccountHandler.ts")

  for (const bucket of ["LEGACY", "IMPORTED_LEGACY", "SUB_ACCOUNT", "CUSTOM_SUB_ACCOUNT", "VIRTUAL_ACCOUNT"]) {
    assert.match(helper, new RegExp(`"${bucket}"`), `missing ${bucket} bucket`)
  }

  assert.match(latestBalance, /syncAffiliateExpressWithdrawBalanceSnapshot/)
  assert.match(helper, /if \(fallbackSource !== null\) return fallbackSource/)
  assert.match(subCreated, /syncAffiliateExpressWithdrawAccountMembership/)
  assert.match(legacyImported, /syncAffiliateExpressWithdrawAccountMembership/)
  assert.match(virtualCreated, /syncAffiliateExpressWithdrawAccountMembership/)
  assert.match(multiAccountAdded, /syncAffiliateExpressWithdrawAccountMembership/)
  assert.match(commonMultiAccountAdded, /setAccountProfileSources\(account, coreSource, coreSource, accountLayerSourceForCore\(coreSource\)\)/)

  assert.doesNotMatch(helper, /eligibleBase/i)
  assert.doesNotMatch(helper, /conservative/i)
  assert.doesNotMatch(helper, /isSafe/i)
})

test("account lifecycle changes remove or reclassify aggregate membership", () => {
  const helper = read("perps/analytics/utils/affiliateExpressWithdrawComponents.ts")
  const deps = read("perps/analytics/deps_accountLayer_1.json")
  const legacyImported = read("perps/analytics/handlers/accountLayer/LegacyAccountImportedHandler.ts")
  const subDeleted = read("perps/analytics/handlers/accountLayer/SubAccountDeletedHandler.ts")
  const virtualDeleted = read("perps/analytics/handlers/accountLayer/VirtualAccountDeletedHandler.ts")
  const virtualReused = read("perps/analytics/handlers/accountLayer/VirtualAccountReusedHandler.ts")
  const singleVAModeChanged = read("perps/analytics/handlers/accountLayer/SingleVAModeChangedHandler.ts")

  assert.match(helper, /removeAffiliateExpressWithdrawAccountMembership/)
  assert.match(helper, /account\.isDeleted == true/)
  assert.match(helper, /syncAffiliateExpressWithdrawAccountPendingRequests/)
  for (const eventName of ["LegacyAccountImported", "SubAccountDeleted", "VirtualAccountDeleted", "VirtualAccountReused", "SingleVAModeChanged"]) {
    assert.match(deps, new RegExp(`"${eventName}"`), `missing ${eventName} lifecycle dependency`)
  }
  assert.match(legacyImported, /removeAffiliateExpressWithdrawAccountMembership/)
  assert.match(legacyImported, /syncAffiliateExpressWithdrawAccountPendingRequests/)
  assert.match(subDeleted, /removeAffiliateExpressWithdrawAccountMembership/)
  assert.match(subDeleted, /syncAffiliateExpressWithdrawAccountPendingRequests/)
  assert.match(virtualDeleted, /removeAffiliateExpressWithdrawAccountMembership/)
  assert.match(virtualDeleted, /syncAffiliateExpressWithdrawAccountPendingRequests/)
  assert.match(virtualReused, /removeAffiliateExpressWithdrawAccountMembership/)
  assert.match(virtualReused, /syncAffiliateExpressWithdrawAccountMembership/)
  assert.match(virtualReused, /syncAffiliateExpressWithdrawAccountPendingRequests/)
  assert.match(singleVAModeChanged, /syncAffiliateExpressWithdrawAccountMembership/)
  assert.match(singleVAModeChanged, /syncAffiliateExpressWithdrawAccountPendingRequests/)
})

test("docs describe affiliate aggregate analytics models", () => {
  const docs = read("docs/affiliate-aggregate-analytics-models.md")

  assert.match(docs, /# Affiliate Aggregate Analytics Models/)
  assert.match(docs, /## `AffiliateExpressWithdrawComponents`/)
  assert.match(docs, /## `AffiliateExpressWithdrawComponentBucket`/)
  assert.match(docs, /## `AffiliateExpressWithdrawAccountSnapshot`/)
  assert.match(docs, /## `ExpressProviderSource`/)
  assert.doesNotMatch(docs, /Muon/)
  assert.doesNotMatch(docs, /Express Withdraw/)
  for (const field of [
    "advancedWithdrawDataAvailable",
    "reservedDebtCollateral",
    "activeDebtCollateral",
    "badDebtCollateral",
    "debtDataAvailable",
  ]) {
    assert.match(docs, new RegExp(field), `docs query missing ${field}`)
  }
})
