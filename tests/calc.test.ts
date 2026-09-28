import test from "node:test";
import assert from "node:assert/strict";
import { RIGHTS_ADVANCE_URL, advanceFlag, computeMoveInCost } from "../src/lib/calc";

const base = {
  rentLow: 1000,
  rentHigh: 2000,
  months: 12,
  commissionRate: 0.1,
  viewingFee: 150,
  movingFee: 400,
};

test("a benchmark range produces a low-to-high band, never one precise figure", () => {
  const result = computeMoveInCost({ ...base, rentOverride: null });
  assert.equal(result.singleFigure, false);
  assert.equal(result.rentLow, 1000);
  assert.equal(result.rentHigh, 2000);
  assert.equal(result.advanceLow, 12000);
  assert.equal(result.advanceHigh, 24000);
  assert.equal(result.commissionLow, 1200);
  assert.equal(result.commissionHigh, 2400);
  assert.equal(result.totalLow, 13750);
  assert.equal(result.totalHigh, 26950);
  assert.ok(result.totalHigh > result.totalLow, "a range must not collapse into a single figure");
});

test("a rent typed by the visitor produces one figure and is labelled as their entry", () => {
  const result = computeMoveInCost({ ...base, rentOverride: 1500 });
  assert.equal(result.singleFigure, true);
  assert.equal(result.rentLow, 1500);
  assert.equal(result.rentHigh, 1500);
  assert.equal(result.advanceLow, 18000);
  assert.equal(result.totalLow, 20350);
  assert.equal(result.totalHigh, 20350);
  const rentLine = result.lines.find((line) => line.key === "rent");
  assert.equal(rentLine?.source, "you");
});

test("benchmark lines are labelled as site estimates and fees as editable assumptions", () => {
  const result = computeMoveInCost({ ...base, rentOverride: null });
  const byKey = Object.fromEntries(result.lines.map((line) => [line.key, line.source]));
  assert.equal(byKey.rent, "benchmark");
  assert.equal(byKey.advance, "benchmark");
  assert.equal(byKey.commission, "assumption");
  assert.equal(byKey.viewing, "assumption");
  assert.equal(byKey.moving, "assumption");
});

test("assumptions are editable and change the total", () => {
  const zeroFees = computeMoveInCost({ ...base, rentOverride: null, commissionRate: 0, viewingFee: 0, movingFee: 0 });
  assert.equal(zeroFees.totalLow, 12000);
  assert.equal(zeroFees.totalHigh, 24000);
  const twentyPercent = computeMoveInCost({ ...base, rentOverride: null, commissionRate: 0.2 });
  assert.equal(twentyPercent.commissionLow, 2400);
});

test("nonsense and out-of-range inputs are clamped instead of producing NaN", () => {
  const result = computeMoveInCost({
    rentLow: Number.NaN,
    rentHigh: -5,
    months: 999,
    commissionRate: Number.NaN,
    viewingFee: Number.NaN,
    movingFee: -100,
  });
  assert.equal(Number.isFinite(result.totalLow), true);
  assert.equal(Number.isFinite(result.totalHigh), true);
  assert.equal(result.rentLow, 0);
});

test("advanceFlag stays quiet at one month", () => {
  const flag = advanceFlag(1);
  assert.equal(flag.level, "none");
});

test("advanceFlag asks for a check between two and six months", () => {
  for (const months of [2, 3, 6]) {
    const flag = advanceFlag(months);
    assert.equal(flag.level, "review");
    assert.equal(flag.rightsUrl, RIGHTS_ADVANCE_URL);
    assert.match(flag.message, /one month/);
  }
});

test("advanceFlag flags anything above six months and links to the sourced page", () => {
  const flag = advanceFlag(12);
  assert.equal(flag.level, "above-six-months");
  assert.equal(flag.rightsUrl, "/rights/six-month-cap");
  assert.match(flag.message, /six months/);
  assert.match(flag.message, /not legal advice|does not approve/i);
});
