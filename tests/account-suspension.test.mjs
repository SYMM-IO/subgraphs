import assert from "node:assert/strict";
import test from "node:test";
import { loadSource } from "./helpers/source.mjs";

const bytes = value => ({ toHexString: () => value });
const number = value => ({
	toString: () => String(value),
	plus: other => number(BigInt(value) + BigInt(other.toString())),
});

function harness() {
	const tables = {},
		schema = {},
		warnings = [];
	for (const name of ["AccountSuspension", "AccountSuspensionLookup", "SuspendedWithdrawal"]) {
		const table = (tables[name] = new Map());
		schema[name] = class {
			constructor(id) {
				this.id = id;
				if (name === "AccountSuspension") {
					for (const prefix of ["suspend", "unsuspend"]) {
						for (const suffix of ["Timestamp", "Transaction", "BlockNumber", "LogIndex"]) this[prefix + suffix] = null;
					}
				}
			}
			static load(id) {
				const row = table.get(id);
				return row ? Object.assign(new this(id), row) : null;
			}
			save() {
				if (name === "SuspendedWithdrawal") assert.ok(!table.has(this.id), "immutable withdrawal overwritten");
				table.set(this.id, { ...this });
			}
		};
	}
	const graph = {
		BigInt: { zero: () => number(0) },
		log: { warning: (...args) => warnings.push(args) },
	};
	const utils = loadSource("perps/analytics/utils/accountSuspension.ts", {
		"@graphprotocol/graph-ts": graph,
		"../../../generated/schema": schema,
	});
	const handlers = {};
	for (const name of ["SetSuspendedAddress", "WithdrawSuspendedUser"]) {
		const loaded = loadSource(`perps/analytics/handlers/symmio/${name}Handler.ts`, {
			"@graphprotocol/graph-ts": graph,
			"../../../../generated/schema": schema,
			"../../../common/BaseHandler": {},
			"../../utils/accountSuspension": utils,
		});
		handlers[name] = new loaded[`${name}Handler`]();
	}
	const event = (index, params, source = "core", user = "user") => ({
		address: bytes(source),
		params: { user: bytes(user), ...params },
		transaction: { hash: bytes("tx") },
		logIndex: number(index),
		block: { timestamp: number(100 + index), number: number(1000 + index) },
	});
	const suspend = (index, flag, source = "core", user = "user", version = 5) => {
		handlers.SetSuspendedAddress.handle(event(index, { isSuspended: flag }, source, user), version);
	};
	const withdraw = (index, amount, source = "core", user = "user", version = 5) => {
		handlers.WithdrawSuspendedUser.handle(
			event(
				index,
				{
					amount: number(amount),
					admin: bytes("admin"),
					recipient: bytes("recipient"),
				},
				source,
				user,
			),
			version,
		);
	};
	return { tables, warnings, event, handlers, suspend, withdraw };
}

test("suspend -> withdrawals -> unsuspend -> suspend keeps separate periods and exact amounts", () => {
	const h = harness();
	h.suspend(1, true);
	h.withdraw(2, "100000000000000000001");
	h.withdraw(3, "9");
	h.suspend(4, false);
	const first = h.tables.AccountSuspension.get("tx-1");
	assert.equal(first.isSuspended, false);
	assert.equal(first.suspendTimestamp.toString(), "101");
	assert.equal(first.unsuspendTimestamp.toString(), "104");
	assert.equal(first.withdrawnSuspendedAmount.toString(), "100000000000000000010");
	assert.equal(first.suspendTransaction.toHexString(), "tx");
	assert.equal(first.unsuspendTransaction.toHexString(), "tx");
	assert.equal(first.unsuspendBlockNumber.toString(), "1004");
	assert.equal(first.unsuspendLogIndex.toString(), "4");
	h.suspend(5, true);
	h.withdraw(6, "7");
	const second = h.tables.AccountSuspension.get("tx-5");
	assert.equal(second.isSuspended, true);
	assert.equal(second.unsuspendTimestamp, null);
	assert.equal(second.unsuspendTransaction, null);
	assert.equal(second.withdrawnSuspendedAmount.toString(), "7");
	assert.deepEqual(h.tables.AccountSuspension.get("tx-1"), first, "closed period must not change");
	assert.equal(h.tables.AccountSuspensionLookup.get("core-user").suspension, "tx-5");
	assert.deepEqual(
		[...h.tables.SuspendedWithdrawal.values()].map(row => row.suspension),
		["tx-1", "tx-1", "tx-5"],
	);
	assert.equal(
		[...h.tables.SuspendedWithdrawal.values()].reduce((sum, row) => sum + BigInt(row.amount.toString()), 0n),
		100000000000000000017n,
	);
	const movement = h.tables.SuspendedWithdrawal.get("tx-2");
	for (const field of ["source", "user", "admin", "recipient"]) assert.equal(movement[field].toHexString(), field === "source" ? "core" : field);
	assert.equal(movement.transactionHash.toHexString(), "tx");
	assert.equal(movement.blockTimestamp.toString(), "102");
	assert.equal(movement.blockNumber.toString(), "1002");
	assert.equal(movement.logIndex.toString(), "2");
	assert.deepEqual(h.warnings, []);
});

test("repeated flags preserve period boundaries and accumulated withdrawals", () => {
	const h = harness();
	h.suspend(1, true);
	h.withdraw(2, 12);
	h.suspend(3, true);
	assert.equal(h.tables.AccountSuspension.size, 1);
	assert.equal(h.tables.AccountSuspension.get("tx-1").suspendTimestamp.toString(), "101");
	assert.equal(h.tables.AccountSuspension.get("tx-1").updateTimestamp.toString(), "103");
	h.suspend(4, false);
	h.suspend(5, false);
	const row = h.tables.AccountSuspension.get("tx-1");
	assert.equal(h.tables.AccountSuspension.size, 1);
	assert.equal(row.unsuspendTimestamp.toString(), "104");
	assert.equal(row.withdrawnSuspendedAmount.toString(), "12");
});

test("lookup separates users and Cores without any account/profile entity", () => {
	const h = harness();
	h.suspend(1, true, "core", "alice");
	h.suspend(2, true, "core", "bob");
	h.suspend(3, true, "other-core", "alice");
	h.withdraw(4, 5, "other-core", "alice");
	h.suspend(5, false, "core", "alice");
	assert.equal(h.tables.AccountSuspension.get("tx-1").isSuspended, false);
	assert.equal(h.tables.AccountSuspension.get("tx-2").isSuspended, true);
	assert.equal(h.tables.AccountSuspension.get("tx-3").isSuspended, true);
	assert.equal(h.tables.SuspendedWithdrawal.get("tx-4").suspension, "tx-3");
	assert.equal(h.tables.AccountSuspensionLookup.size, 3);
});

test("an unsuspend observed first records its end without inventing a start", () => {
	const h = harness();
	h.suspend(1, false);
	h.suspend(2, false);
	const partial = h.tables.AccountSuspension.get("tx-1");
	assert.equal(partial.isSuspended, false);
	assert.equal(partial.suspendTimestamp, null);
	assert.equal(partial.suspendTransaction, null);
	assert.equal(partial.unsuspendTimestamp.toString(), "101");
	assert.equal(partial.withdrawnSuspendedAmount.toString(), "0");
	h.suspend(3, true);
	assert.equal(h.tables.AccountSuspension.size, 2);
	assert.equal(h.tables.AccountSuspension.get("tx-3").suspendTimestamp.toString(), "103");
});

test("a withdrawal without an observed open period keeps its amounts and unknown start", () => {
	const h = harness();
	h.withdraw(1, 17);
	const partial = h.tables.AccountSuspension.get("tx-1");
	assert.equal(partial.isSuspended, true);
	assert.equal(partial.suspendTimestamp, null);
	assert.equal(partial.withdrawnSuspendedAmount.toString(), "17");
	assert.equal(h.tables.SuspendedWithdrawal.get("tx-1").suspension, partial.id);
	assert.equal(h.warnings.length, 1);
	h.suspend(2, true);
	assert.equal(h.tables.AccountSuspension.get("tx-1").suspendTimestamp, null, "a repeated true flag cannot recover an earlier missing start");
	h.suspend(3, false);
	h.withdraw(4, 23);
	assert.equal(h.tables.AccountSuspension.size, 2);
	assert.equal(h.tables.AccountSuspension.get("tx-1").withdrawnSuspendedAmount.toString(), "17");
	assert.equal(h.tables.SuspendedWithdrawal.get("tx-4").suspension, "tx-4");
	assert.equal(h.tables.AccountSuspension.get("tx-4").suspendTimestamp, null);
});

test("a withdrawal log cannot be counted twice and zero amounts remain valid", () => {
	const h = harness();
	h.suspend(1, true);
	h.withdraw(2, 7);
	h.withdraw(2, 7);
	h.withdraw(3, 0);
	assert.equal(h.tables.SuspendedWithdrawal.size, 2);
	assert.equal(h.tables.AccountSuspension.get("tx-1").withdrawnSuspendedAmount.toString(), "7");
});

test("same-block and same-transaction cycles are linked in log order", () => {
	const h = harness();
	for (const [index, flag] of [
		[0, true],
		[2, false],
		[3, true],
	]) {
		const event = h.event(index, { isSuspended: flag });
		event.block = { timestamp: number(100), number: number(200) };
		h.handlers.SetSuspendedAddress.handle(event, 6);
		if (flag) {
			const withdrawal = h.event(index + 1, { amount: number(index + 10), admin: bytes("admin"), recipient: bytes("recipient") });
			withdrawal.block = event.block;
			h.handlers.WithdrawSuspendedUser.handle(withdrawal, 6);
		}
	}
	assert.deepEqual(
		[...h.tables.SuspendedWithdrawal.values()].map(row => row.suspension),
		["tx-0", "tx-3"],
	);
	assert.equal(h.tables.AccountSuspension.get("tx-0").suspendLogIndex.toString(), "0");
	assert.equal(h.tables.AccountSuspension.get("tx-0").unsuspendLogIndex.toString(), "2");
	assert.equal(h.tables.AccountSuspension.get("tx-3").isSuspended, true);
});

test("a period survives Core ABI upgrades", () => {
	const h = harness();
	h.suspend(1, true, "core", "user", 0);
	h.withdraw(2, 19, "core", "user", 5);
	h.suspend(3, false, "core", "user", 6);
	assert.equal(h.tables.AccountSuspension.size, 1);
	assert.equal(h.tables.AccountSuspension.get("tx-1").withdrawnSuspendedAmount.toString(), "19");
	assert.equal(h.tables.AccountSuspension.get("tx-1").isSuspended, false);
});
