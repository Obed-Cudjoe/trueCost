import test from "node:test";
import assert from "node:assert/strict";
import { formatGhs, median, parseMoneyRange, roomTypeFamily } from "../src/lib/benchmarks";

test("formatGhs renders Ghana cedis with thousands separators", () => {
  assert.equal(formatGhs(1500), "GH₵1,500");
  assert.equal(formatGhs(0), "GH₵0");
  assert.equal(formatGhs(1234.6), "GH₵1,235");
  assert.equal(formatGhs(Number.NaN), "—");
});

test("parseMoneyRange reads written ranges and rejects noise", () => {
  assert.deepEqual(parseMoneyRange("GH₵800–1,500"), { min: 800, max: 1500 });
  assert.deepEqual(parseMoneyRange("GH₵9,000–20,000"), { min: 9000, max: 20000 });
  assert.deepEqual(parseMoneyRange("1200-2500"), { min: 1200, max: 2500 });
  assert.deepEqual(parseMoneyRange("GH₵1,500"), { min: 1500, max: 1500 });
  assert.equal(parseMoneyRange("not recorded"), null);
  assert.equal(parseMoneyRange(""), null);
});

test("roomTypeFamily groups equivalent wording without merging unlike units", () => {
  assert.equal(roomTypeFamily("Single room self-contain"), "single");
  assert.equal(roomTypeFamily("Chamber & hall s/c"), "chamber");
  assert.equal(roomTypeFamily("2-bedroom apartment"), "two-bed");
  assert.equal(roomTypeFamily("2-bedroom (gated)"), "two-bed");
  assert.equal(roomTypeFamily("2-bedroom (estate)"), "two-bed");
  assert.equal(roomTypeFamily("3-Bedroom House"), "three-bed");
  assert.equal(roomTypeFamily("Shared hostel-style room"), "shared");
  assert.notEqual(roomTypeFamily("Single room self-contain"), roomTypeFamily("Chamber & hall s/c"));
});

test("median handles odd, even and empty inputs", () => {
  assert.equal(median([1000, 2000, 3000]), 2000);
  assert.equal(median([1000, 2000]), 1500);
  assert.equal(median([]), 0);
  assert.equal(median([500]), 500);
});
