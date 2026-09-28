import test from "node:test";
import assert from "node:assert/strict";
import { REPORT_BASES, summariseApproved, validateReport } from "../src/lib/reports";

const published = {
  areas: ["spintex", "kasoa"],
  roomTypes: ["Single room self-contain", "Chamber & hall s/c", "2-bedroom apartment"],
};
const today = "2026-09-28";

const good = {
  areaSlug: "spintex",
  roomType: "Chamber & hall s/c",
  observedRent: "1500",
  observedOn: "2026-09-01",
  basis: "asking",
};

test("a complete report validates and keeps optional fields optional", () => {
  const result = validateReport(good, published, today);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.observedRent, 1500);
    assert.equal(result.value.contact, "");
    assert.equal(result.value.sourceContext, "");
  }
});

test("rent written with a currency symbol and separators is accepted", () => {
  const result = validateReport({ ...good, observedRent: "GH₵1,500" }, published, today);
  assert.equal(result.ok, true);
});

test("reports are tied to published areas and room types only", () => {
  const unknownArea = validateReport({ ...good, areaSlug: "nowhere" }, published, today);
  assert.equal(unknownArea.ok, false);
  const unknownType = validateReport({ ...good, roomType: "Castle" }, published, today);
  assert.equal(unknownType.ok, false);
});

test("rent must be a plausible number", () => {
  for (const rent of ["", "abc", "0", "-50", "5000000"]) {
    const result = validateReport({ ...good, observedRent: rent }, published, today);
    assert.equal(result.ok, false, `expected "${rent}" to be rejected`);
  }
});

test("future and impossible observation dates are rejected", () => {
  const future = validateReport({ ...good, observedOn: "2026-10-01" }, published, today);
  assert.equal(future.ok, false);
  const ancient = validateReport({ ...good, observedOn: "1999-12-31" }, published, today);
  assert.equal(ancient.ok, false);
  const malformed = validateReport({ ...good, observedOn: "01/09/2026" }, published, today);
  assert.equal(malformed.ok, false);
});

test("the basis is required and limited to the published options", () => {
  const missing = validateReport({ ...good, basis: undefined }, published, today);
  assert.equal(missing.ok, false);
  const wrong = validateReport({ ...good, basis: "vibes" }, published, today);
  assert.equal(wrong.ok, false);
  for (const basis of REPORT_BASES) {
    const result = validateReport({ ...good, basis }, published, today);
    assert.equal(result.ok, true, `basis "${basis}" should be accepted`);
  }
});

test("contact details stay optional", () => {
  const withContact = validateReport({ ...good, contact: "0244123456" }, published, today);
  assert.equal(withContact.ok, true);
  if (withContact.ok) assert.equal(withContact.value.contact, "0244123456");
});

function row(overrides: Record<string, unknown>) {
  return { area_slug: "spintex", room_type: "Chamber & hall s/c", observed_rent: 1500, observed_on: "2026-09-01", status: "approved", basis: "asking", ...overrides };
}

test("only approved reports are summarised", () => {
  const summary = summariseApproved(
    [
      row({ status: "pending", observed_rent: 999_999 }),
      row({ status: "rejected", observed_rent: 888_888 }),
      row({ status: "needs_clarification", observed_rent: 777_777 }),
      row({ observed_rent: 1500 }),
      row({ observed_rent: 2100, observed_on: "2026-09-20", basis: "paid" }),
      row({ area_slug: "kasoa", observed_rent: 900 }),
    ],
    "spintex",
  );
  assert.equal(summary.total, 2);
  assert.equal(summary.groups.length, 1);
  assert.equal(summary.groups[0].roomType, "Chamber & hall s/c");
  assert.equal(summary.groups[0].count, 2);
  assert.equal(summary.groups[0].min, 1500);
  assert.equal(summary.groups[0].max, 2100);
  assert.equal(summary.groups[0].median, 1800);
  assert.equal(summary.groups[0].firstObserved, "2026-09-01");
  assert.equal(summary.groups[0].lastObserved, "2026-09-20");
  assert.deepEqual(summary.groups[0].basisCounts, { asking: 1, paid: 1, unknown: 0 });
});

test("an area with no approved reports returns an empty summary, not an estimate", () => {
  const summary = summariseApproved([row({ status: "pending" })], "spintex");
  assert.equal(summary.total, 0);
  assert.deepEqual(summary.groups, []);
});

test("a single approved report shows one figure and no spread", () => {
  const summary = summariseApproved([row({ observed_rent: 1750 })], "spintex");
  assert.equal(summary.groups[0].min, 1750);
  assert.equal(summary.groups[0].max, 1750);
  assert.equal(summary.groups[0].median, 1750);
});
