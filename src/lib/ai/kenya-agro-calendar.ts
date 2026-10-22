/**
 * Lightweight, static reference data for Kenyan planting-season guidance.
 *
 * This intentionally does NOT try to be a precise meteorological model —
 * Kenya's rainfall is genuinely variable year to year and hyper-local. It's
 * a reasonable general baseline (grouping counties into broad agro-climatic
 * zones) that keeps the AI assistant's answers grounded in real seasonal
 * patterns rather than pure guesswork, while the UI and the assistant's own
 * reply both make clear this is general guidance — a real planting decision
 * should factor in the current season's forecast (e.g. from the Kenya
 * Meteorological Department) and, ideally, a local agronomist's site visit
 * (which the in-app advisor directory can connect the user to).
 */

export type AgroZoneKey =
  | "highlands"
  | "western"
  | "coastal"
  | "eastern-dryland"
  | "arid-north"
  | "lake-basin"
  | "rift-valley-agri";

export interface AgroZone {
  key: AgroZoneKey;
  label: string;
  longRains: string; // main rainy season, planting window
  shortRains: string; // second rainy season, planting window
  notes: string;
}

export const AGRO_ZONES: Record<AgroZoneKey, AgroZone> = {
  highlands: {
    key: "highlands",
    label: "Central & Rift Valley Highlands",
    longRains: "Mid-March to May (main planting window)",
    shortRains: "Mid-October to December (second season)",
    notes:
      "High, reliable rainfall and fertile volcanic soils. Kenya's most productive agricultural zone — supports two full growing seasons a year for most crops.",
  },
  western: {
    key: "western",
    label: "Western Kenya",
    longRains: "March to May",
    shortRains: "August to September (second season, shorter but usable)",
    notes:
      "Fairly reliable, near-bimodal rainfall. Good for maize, sugarcane, and beans across most of the year.",
  },
  coastal: {
    key: "coastal",
    label: "Coastal Kenya",
    longRains: "April to June",
    shortRains: "October to December",
    notes:
      "Humid, warmer climate. Long rains are the heavier season; short rains are lighter but still useful for quick-maturing crops.",
  },
  "eastern-dryland": {
    key: "eastern-dryland",
    label: "Eastern & Lower Midland Kenya",
    longRains: "March to May (often lighter/less reliable)",
    shortRains: "October to December (frequently the more dependable season here)",
    notes:
      "Semi-arid with variable rainfall. Drought-tolerant crops and water harvesting matter more than in the highlands.",
  },
  "arid-north": {
    key: "arid-north",
    label: "Arid & Semi-Arid Northern Kenya",
    longRains: "March to May (unreliable)",
    shortRains: "October to November (short window, often the better bet)",
    notes:
      "Arid/pastoral zone — cropping is high-risk without irrigation. Livestock (camels, goats, cattle) and drought-tolerant crops like sorghum/millet dominate.",
  },
  "lake-basin": {
    key: "lake-basin",
    label: "Lake Victoria Basin",
    longRains: "March to May",
    shortRains: "September to November",
    notes: "Warm and humid with fairly reliable rainfall; good for maize, sorghum, rice (in irrigation schemes), and cotton.",
  },
  "rift-valley-agri": {
    key: "rift-valley-agri",
    label: "North & South Rift Agricultural Belt",
    longRains: "April to June",
    shortRains: "Short/unreliable — long rains dominate this zone",
    notes:
      "Kenya's grain basket — large-scale wheat, maize and barley farming. Mostly single-season cropping timed to the long rains.",
  },
};

export const COUNTY_TO_ZONE: Record<string, AgroZoneKey> = {
  Nyeri: "highlands", Kirinyaga: "highlands", "Murang'a": "highlands",
  Kiambu: "highlands", Nyandarua: "highlands", Nakuru: "highlands",
  Kericho: "highlands", Bomet: "highlands", Embu: "highlands",
  Meru: "highlands", "Tharaka-Nithi": "highlands", Laikipia: "highlands",
  Nairobi: "highlands",

  Kakamega: "western", Vihiga: "western", Bungoma: "western", Busia: "lake-basin",
  Kisumu: "lake-basin", Siaya: "lake-basin", "Homa Bay": "lake-basin",
  Migori: "lake-basin", Kisii: "western", Nyamira: "western",

  Mombasa: "coastal", Kwale: "coastal", Kilifi: "coastal",
  "Tana River": "coastal", Lamu: "coastal", "Taita-Taveta": "coastal",

  Kitui: "eastern-dryland", Machakos: "eastern-dryland", Makueni: "eastern-dryland",

  Turkana: "arid-north", "West Pokot": "arid-north", Samburu: "arid-north",
  Marsabit: "arid-north", Isiolo: "arid-north", Garissa: "arid-north",
  Wajir: "arid-north", Mandera: "arid-north",

  "Trans Nzoia": "rift-valley-agri", "Uasin Gishu": "rift-valley-agri",
  "Elgeyo-Marakwet": "rift-valley-agri", Nandi: "rift-valley-agri",
  Baringo: "rift-valley-agri", Narok: "rift-valley-agri", Kajiado: "eastern-dryland",
};

export interface CropProfile {
  name: string;
  aliases?: string[];
  waterNeed: "low" | "medium" | "high";
  maturityDays: string;
  bestZones: AgroZoneKey[];
  notes: string;
}

export const CROP_PROFILES: CropProfile[] = [
  { name: "Maize", waterNeed: "medium", maturityDays: "90-180 depending on variety",
    bestZones: ["highlands", "western", "lake-basin", "rift-valley-agri"],
    notes: "Kenya's staple. Plant at the start of the long or short rains; avoid planting into a dry spell." },
  { name: "Beans", waterNeed: "medium", maturityDays: "60-90",
    bestZones: ["highlands", "western", "lake-basin", "eastern-dryland"],
    notes: "Fast-maturing — works well as a short-rains crop or intercropped with maize." },
  { name: "Sorghum", aliases: ["mtama"], waterNeed: "low", maturityDays: "90-120",
    bestZones: ["eastern-dryland", "arid-north", "lake-basin"],
    notes: "Drought-tolerant staple, a strong choice where rainfall is unreliable." },
  { name: "Millet", waterNeed: "low", maturityDays: "70-100",
    bestZones: ["eastern-dryland", "arid-north"],
    notes: "Very drought-tolerant; good for arid and semi-arid areas." },
  { name: "Irish Potatoes", aliases: ["potatoes", "potato"], waterNeed: "medium", maturityDays: "90-120",
    bestZones: ["highlands"],
    notes: "Needs cool highland temperatures and well-drained soil; plant at the start of the rains." },
  { name: "Sweet Potatoes", waterNeed: "low", maturityDays: "90-150",
    bestZones: ["western", "lake-basin", "eastern-dryland", "coastal"],
    notes: "Tolerant of poorer soils and moisture stress once established." },
  { name: "Cassava", waterNeed: "low", maturityDays: "270-365",
    bestZones: ["coastal", "lake-basin", "western", "eastern-dryland"],
    notes: "Long maturity but very drought-tolerant once established — a good food-security crop." },
  { name: "Tea", waterNeed: "high", maturityDays: "Perennial (first harvest ~2-3 years after planting)",
    bestZones: ["highlands"],
    notes: "Needs high, well-distributed rainfall and cool highland conditions; plant at the start of the rains for establishment." },
  { name: "Coffee", waterNeed: "medium", maturityDays: "Perennial (first harvest ~3-4 years after planting)",
    bestZones: ["highlands"],
    notes: "Prefers well-drained volcanic soils at 1,400-2,000m; establish seedlings at the start of the long rains." },
  { name: "Tomatoes", waterNeed: "high", maturityDays: "75-100",
    bestZones: ["highlands", "eastern-dryland", "rift-valley-agri"],
    notes: "High water need — often grown with irrigation outside the rains for better market timing and disease control." },
  { name: "Cabbages", waterNeed: "high", maturityDays: "70-100",
    bestZones: ["highlands"],
    notes: "Needs consistent moisture; irrigation extends planting beyond the rains." },
  { name: "Onions", waterNeed: "medium", maturityDays: "90-150",
    bestZones: ["highlands", "eastern-dryland", "rift-valley-agri"],
    notes: "Sensitive to waterlogging — plant on raised beds with good drainage." },
  { name: "Bananas", waterNeed: "high", maturityDays: "Perennial (first harvest ~9-12 months)",
    bestZones: ["highlands", "western", "coastal", "lake-basin"],
    notes: "Needs consistent moisture year-round; irrigation helps a lot in drier months." },
  { name: "Avocado", waterNeed: "medium", maturityDays: "Perennial (first harvest ~3-5 years)",
    bestZones: ["highlands"],
    notes: "Strong export crop from Kenyan highlands; plant seedlings at the start of the long rains." },
  { name: "Macadamia", waterNeed: "medium", maturityDays: "Perennial (first harvest ~4-6 years)",
    bestZones: ["highlands"],
    notes: "Long-term tree crop; establish at the start of the rains for best root development." },
  { name: "Sugarcane", waterNeed: "high", maturityDays: "365-540",
    bestZones: ["western", "lake-basin", "coastal"],
    notes: "Needs sustained moisture over a long growth cycle; best in higher-rainfall zones." },
  { name: "Cotton", waterNeed: "medium", maturityDays: "150-180",
    bestZones: ["lake-basin", "eastern-dryland", "coastal"],
    notes: "Moderately drought-tolerant once established; plant at the start of the rains." },
  { name: "Sunflower", waterNeed: "low", maturityDays: "90-120",
    bestZones: ["rift-valley-agri", "eastern-dryland", "lake-basin"],
    notes: "Reasonably drought-tolerant oilseed crop, good rotation option with maize." },
  { name: "Groundnuts", aliases: ["peanuts"], waterNeed: "low", maturityDays: "90-120",
    bestZones: ["western", "lake-basin", "eastern-dryland"],
    notes: "Fixes nitrogen — a good rotation crop, tolerant of moderate moisture stress." },
  { name: "Rice", waterNeed: "high", maturityDays: "105-150",
    bestZones: ["lake-basin", "rift-valley-agri"],
    notes: "Needs standing water or a managed irrigation scheme (e.g. Mwea, Ahero) — rain-fed rice is high-risk in Kenya." },
];

export function resolveZoneForCounty(county: string): AgroZone | null {
  const normalized = county.trim();
  const key =
    COUNTY_TO_ZONE[normalized] ??
    COUNTY_TO_ZONE[
      Object.keys(COUNTY_TO_ZONE).find(
        (c) => c.toLowerCase() === normalized.toLowerCase(),
      ) ?? ""
    ];
  return key ? AGRO_ZONES[key] : null;
}

export function resolveCropProfile(cropName: string): CropProfile | null {
  const normalized = cropName.trim().toLowerCase();
  return (
    CROP_PROFILES.find(
      (c) =>
        c.name.toLowerCase() === normalized ||
        c.aliases?.some((a) => a.toLowerCase() === normalized),
    ) ??
    CROP_PROFILES.find(
      (c) =>
        c.name.toLowerCase().includes(normalized) ||
        normalized.includes(c.name.toLowerCase()),
    ) ??
    null
  );
}
