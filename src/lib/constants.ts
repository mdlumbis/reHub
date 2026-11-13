/** Static content shown on the homepage. Move to the database once real data exists. */

export const SPECIALTIES = [
  { slug: "physiatrist", name: "Physiatrists", blurb: "Specialist-led recovery", icon: "stethoscope" },
  { slug: "physical-therapist", name: "Physical therapists", blurb: "Move with confidence", icon: "activity" },
  { slug: "occupational-therapist", name: "Occupational therapists", blurb: "Everyday independence", icon: "hand" },
  { slug: "speech-language-pathologist", name: "Speech-language pathologists", blurb: "Communication & swallowing", icon: "messages" },
] as const;

export const PHILHEALTH_PACKAGES = [
  { name: "CWD Developmental package", blurb: "Developmental care for children with disabilities" },
  { name: "CWD Mobility package", blurb: "Support for movement and mobility needs" },
  { name: "Adult Z Morph package", blurb: "Prosthetic and orthotic rehabilitation support" },
];

export const COVERAGE_OPTIONS = [
  "Accepts guarantee letters",
  "Accepts DSWD assistance",
  "Maxicare",
  "Intellicare",
  "MediCard",
  "PhilCare",
  "ValuCare",
  "Kaiser International",
  "Cocolife",
  "Etiqa",
  "Pacific Cross",
];

/** Placeholder numbers for the hero stats until real counts come from the database. */
export const HERO_STATS = [
  { value: "1,284", label: "verified providers" },
  { value: "318", label: "rehab clinics" },
  { value: "5 km", label: "radius ranking" },
  { value: "23", label: "HMOs accepted" },
];
