// Generates illustrated placeholder avatars for demo providers into public/avatars/.
// Style: DiceBear "Notionists" by Zoish, CC0 1.0 (public domain). Not photos of real people.
// Usage: node scripts/generate-avatars.mjs
// To add someone: add a line to PEOPLE (pick a hair variant 01-63), then re-run.
import { mkdirSync, writeFileSync } from "node:fs";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

const PEOPLE = {
  "sofia.reyes":     { hair: "variant28", bg: "dbe7f0" },
  "ramon.villaflor": { hair: "variant13", bg: "d4e6e0", glasses: true },
  "elena.cruz":      { hair: "variant41", bg: "efe6dc", glasses: true },
  "miguel.santos":   { hair: "variant24", bg: "e6f0ec" },
  "andrea.lim":      { hair: "variant23", bg: "efe6dc" },
  "carla.mendoza":   { hair: "variant39", bg: "e6f0ec" },
  "paolo.garcia":    { hair: "variant55", bg: "dbe7f0", beard: true },
  "jose.navarro":    { hair: "variant42", bg: "d4e6e0" },
};

mkdirSync("public/avatars", { recursive: true });
for (const [username, o] of Object.entries(PEOPLE)) {
  const svg = createAvatar(notionists, {
    seed: username,
    hair: [o.hair],
    backgroundColor: [o.bg],
    backgroundType: ["solid"],
    gestureProbability: 0,
    bodyIconProbability: 0,
    glassesProbability: o.glasses ? 100 : 0,
    glasses: ["variant03", "variant08", "variant11"], // clear lenses only
    lips: ["variant03", "variant05", "variant09", "variant14", "variant17", "variant21", "variant22"], // calm smiles
    beardProbability: o.beard ? 100 : 0,
    beard: ["variant01", "variant02"],
  }).toString();
  writeFileSync(`public/avatars/${username}.svg`, svg);
  console.log(`public/avatars/${username}.svg`);
}
