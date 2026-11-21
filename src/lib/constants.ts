/** Static content shown on the homepage. Move to the database once real data exists. */

export const SPECIALTIES = [
  { slug: "physiatrist", name: "Physiatrists", blurb: "Specialist-led recovery", icon: "stethoscope" },
  { slug: "physical-therapist", name: "Physical therapists", blurb: "Move with confidence", icon: "activity" },
  { slug: "occupational-therapist", name: "Occupational therapists", blurb: "Everyday independence", icon: "hand" },
  { slug: "speech-language-pathologist", name: "Speech-language pathologists", blurb: "Communication & swallowing", icon: "messages" },
] as const;

export const PHILHEALTH_PACKAGES = [
  { slug: "philhealth-cwd-developmental", name: "CWD Developmental package", blurb: "Developmental care for children with disabilities" },
  { slug: "philhealth-cwd-mobility", name: "CWD Mobility package", blurb: "Support for movement and mobility needs" },
  { slug: "philhealth-adult-z-morph", name: "Adult Z Morph package", blurb: "Prosthetic and orthotic rehabilitation support" },
];

/** Homepage coverage chips. `slug` matches coverage_options.slug in the database. */
export const COVERAGE_OPTIONS = [
  { label: "Accepts guarantee letters", slug: "guarantee-letter" },
  { label: "Accepts DSWD assistance", slug: "dswd" },
  { label: "Maxicare", slug: "maxicare" },
  { label: "Intellicare", slug: "intellicare" },
  { label: "MediCard", slug: "medicard" },
  { label: "PhilCare", slug: "philcare" },
  { label: "ValuCare", slug: "valucare" },
  { label: "Kaiser International", slug: "kaiser" },
  { label: "Cocolife", slug: "cocolife" },
  { label: "Etiqa", slug: "etiqa" },
  { label: "Pacific Cross", slug: "pacific-cross" },
];

/** Placeholder numbers for the hero stats until real counts come from the database. */
export const HERO_STATS = [
  { value: "1,284", label: "verified providers" },
  { value: "318", label: "rehab clinics" },
  { value: "5 km", label: "radius ranking" },
  { value: "23", label: "HMOs accepted" },
];
