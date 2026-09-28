import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_COMPARE,
  buildAreaComparison,
  buildInitial,
  buildRoomTypeComparison,
  parseSlugs,
  parseTypes,
  sharedRoomTypes,
  type CompareArea,
} from "../src/lib/compare";

const spintex: CompareArea = {
  slug: "spintex",
  name: "Spintex",
  tagline: "Family-friendly corridor",
  lastVerified: "Sep 2026",
  prices: [
    { type: "Single room self-contain", min: 1000, max: 2000, advance: "Not source-documented" },
    { type: "Chamber & hall s/c", min: 1500, max: 3000, advance: "Not source-documented" },
    { type: "2-bedroom apartment", min: 3500, max: 7000, advance: "Not source-documented" },
    { type: "2-bedroom (estate)", min: 6000, max: 12000, advance: "Not source-documented" },
  ],
  realities: [
    { icon: "water", title: "Water", text: "Varies by block." },
    { icon: "power", title: "Power", text: "Fairly stable." },
    { icon: "transport", title: "Transport", text: "Trotro and ride-hailing available." },
    { icon: "noise", title: "Noise", text: "Quieter inside estates." },
  ],
};

const kasoa: CompareArea = {
  slug: "kasoa",
  name: "Kasoa",
  tagline: "Cheapest corridor",
  lastVerified: "Sep 2026",
  prices: [
    { type: "Single room self-contain", min: 500, max: 1000, advance: "Not source-documented" },
    { type: "Chamber & hall s/c", min: 800, max: 1500, advance: "Not source-documented" },
    { type: "2-bedroom apartment", min: 1500, max: 3000, advance: "Not source-documented" },
    { type: "2-bedroom house", min: 2500, max: 5000, advance: "Not source-documented" },
  ],
  realities: [{ icon: "transport", title: "Transport", text: "Long commute at peak." }],
};

const madina: CompareArea = {
  slug: "madina",
  name: "Madina",
  tagline: "Student belt",
  lastVerified: "Sep 2026",
  prices: [
    { type: "Single room self-contain", min: 700, max: 1500, advance: "Not source-documented" },
    { type: "Chamber & hall s/c", min: 1200, max: 2500, advance: "Not source-documented" },
    { type: "Shared hostel-style room", min: 600, max: 1200, advance: "Not source-documented" },
  ],
  realities: [],
};

const areas = [spintex, kasoa, madina];

test("parseSlugs only accepts published areas, drops duplicates and caps the count", () => {
  assert.deepEqual(parseSlugs(["spintex", "spintex", "kasoa", "madina", "osu"], ["spintex", "kasoa", "madina"]), ["spintex", "kasoa", "madina"]);
  assert.deepEqual(parseSlugs(["spintex", "nowhere"], ["spintex"]), ["spintex"]);
  assert.deepEqual(parseSlugs(undefined, ["spintex"]), []);
  assert.ok(parseSlugs(["spintex", "kasoa", "madina", "osu"], ["spintex", "kasoa", "madina", "osu"]).length === MAX_COMPARE);
});

test("parseTypes only accepts published room types", () => {
  assert.deepEqual(parseTypes(["Single room self-contain", "Igloo"], ["Single room self-contain"]), ["Single room self-contain"]);
  assert.deepEqual(parseTypes("Chamber & hall s/c", ["Chamber & hall s/c"]), ["Chamber & hall s/c"]);
});

test("sharedRoomTypes only returns types every selected area records", () => {
  const shared = sharedRoomTypes([spintex, kasoa]);
  assert.ok(shared.includes("Chamber & hall s/c"));
  assert.ok(shared.includes("2-bedroom apartment"));
  assert.equal(shared.includes("Shared hostel-style room"), false);
});

test("area comparison lines up families and keeps genuinely missing cells empty", () => {
  const result = buildAreaComparison([spintex, kasoa]);
  const twoBed = result.rows.find((row) => row.family === "two-bed");
  assert.ok(twoBed);
  assert.equal(twoBed?.cells.length, 2);
  assert.deepEqual(
    twoBed?.cells.map((cell) => [cell.min, cell.max]),
    [
      [3500, 7000],
      [1500, 3000],
    ],
  );
  assert.equal(twoBed?.multiple, true, "Spintex records two 2-bedroom options");
  assert.equal(twoBed?.mismatched, false, "both use the same 2-bedroom apartment label");

  const shared = result.rows.find((row) => row.family === "shared");
  assert.equal(shared, undefined, "no selected area records a shared room");
});

test("a missing room type is never filled with an estimate", () => {
  const result = buildAreaComparison([spintex, madina]);
  const twoBed = result.rows.find((row) => row.family === "two-bed");
  assert.equal(twoBed?.cells[0].recorded, true);
  assert.equal(twoBed?.cells[1].recorded, false);
  assert.equal(twoBed?.cells[1].min, 0);
});

test("unlike room types are shown side by side with their own labels, never merged", () => {
  const result = buildAreaComparison([spintex, kasoa], "2-bedroom (estate)");
  const row = result.rows.find((entry) => entry.family === "two-bed");
  assert.ok(row);
  assert.equal(row?.mismatched, true);
  assert.equal(row?.labels[0], "2-bedroom (estate)");
  assert.equal(row?.labels[1], "2-bedroom apartment");
});

test("notSharedEverywhere reports types missing from at least one area", () => {
  const result = buildAreaComparison([spintex, madina]);
  assert.ok(result.notSharedEverywhere.includes("2-bedroom apartment"));
  assert.deepEqual(result.emptyAreas, []);
});

test("room-type comparison stays inside one area and reports missing types", () => {
  const result = buildRoomTypeComparison(spintex, ["Single room self-contain", "3-Bedroom House"]);
  assert.deepEqual(result.missing, ["3-Bedroom House"]);
  const range = result.rows.find((row) => row.label === "Recorded monthly range");
  assert.deepEqual(range?.values, ["GH₵1,000 – GH₵2,000", "Not recorded"]);
  const transport = result.rows.find((row) => row.label === "Transport");
  assert.deepEqual(transport?.values, ["Trotro and ride-hailing available.", "Trotro and ride-hailing available."]);
});

test("room-type comparison degrades safely with no area", () => {
  const result = buildRoomTypeComparison(null, ["Single room self-contain"]);
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.missing, ["Single room self-contain"]);
});

test("buildInitial only ever publishes real slugs and room types", () => {
  const initial = buildInitial({ a: ["spintex", "ghost"], area: "kasoa", t: ["Shared hostel-style room", "Castle"] }, areas);
  assert.equal(initial.mode, "areas");
  assert.deepEqual(initial.slugs, ["spintex"]);
  assert.equal(initial.areaSlug, "kasoa");
  assert.deepEqual(initial.types, []);

  const rooms = buildInitial({ mode: "rooms", area: "madina", t: ["Shared hostel-style room"] }, areas);
  assert.equal(rooms.mode, "rooms");
  assert.equal(rooms.areaSlug, "madina");
  assert.deepEqual(rooms.types, ["Shared hostel-style room"]);
});
