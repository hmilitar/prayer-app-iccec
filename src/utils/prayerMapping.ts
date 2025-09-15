// Prayer ID mapping across languages
// This maps equivalent prayers between different languages

export interface PrayerMapping {
  [key: string]: string[];
}

// Prayer equivalence mapping
// Each array contains prayer IDs that represent the same prayer in different languages
export const PRAYER_ID_MAPPINGS: PrayerMapping = {
  // The Lord's Prayer
  "lords-prayer": ["lords-prayer", "ama-namin", "meie-isa"],
  "ama-namin": ["lords-prayer", "ama-namin", "meie-isa"],
  "meie-isa": ["lords-prayer", "ama-namin", "meie-isa"],

  // Gloria Patri / Glory Be
  "gloria-patri": ["gloria-patri", "luwalhati-sa-diyos", "au-olgu-isale"],
  "luwalhati-sa-diyos": ["gloria-patri", "luwalhati-sa-diyos", "au-olgu-isale"],
  "au-olgu-isale": ["gloria-patri", "luwalhati-sa-diyos", "au-olgu-isale"],

  // Apostles' Creed
  "apostles-creed": ["apostles-creed", "sumasampalataya-ako", "apostlite-uskutunnistus"],
  "sumasampalataya-ako": ["apostles-creed", "sumasampalataya-ako", "apostlite-uskutunnistus"],
  "apostlite-uskutunnistus": ["apostles-creed", "sumasampalataya-ako", "apostlite-uskutunnistus"],

  // Come Holy Spirit (same ID across languages)
  "come-holy-spirit": ["come-holy-spirit"],

  // Morning Prayer
  "morning-prayer": ["morning-prayer", "panalangin-sa-umaga", "hommikupalve"],
  "panalangin-sa-umaga": ["morning-prayer", "panalangin-sa-umaga", "hommikupalve"],
  "hommikupalve": ["morning-prayer", "panalangin-sa-umaga", "hommikupalve"],

  // Evening Prayer
  "evening-prayer": ["evening-prayer", "panalangin-sa-gabi", "ohtupalve"],
  "panalangin-sa-gabi": ["evening-prayer", "panalangin-sa-gabi", "ohtupalve"],
  "ohtupalve": ["evening-prayer", "panalangin-sa-gabi", "ohtupalve"],

  // Prayer for Spiritual Gifts (same ID for en/tl/et)
  "prayer-for-spiritual-gifts": ["prayer-for-spiritual-gifts"],

  // Prayer before Communion (same ID for en/tl)
  "prayer-before-communion": ["prayer-before-communion"],

  // Prayer before Meals
  "prayer-before-meals": ["prayer-before-meals", "panalangin-bago-kumain", "palve-enne-sooki"],
  "panalangin-bago-kumain": ["prayer-before-meals", "panalangin-bago-kumain", "palve-enne-sooki"],
  "palve-enne-sooki": ["prayer-before-meals", "panalangin-bago-kumain", "palve-enne-sooki"],

  // Prayer for Peace
  "prayer-for-peace": ["prayer-for-peace", "panalangin-para-sa-kapayapaan", "palve-rahu-eest"],
  "panalangin-para-sa-kapayapaan": ["prayer-for-peace", "panalangin-para-sa-kapayapaan", "palve-rahu-eest"],
  "palve-rahu-eest": ["prayer-for-peace", "panalangin-para-sa-kapayapaan", "palve-rahu-eest"],

  // Prayer for Healing
  "prayer-for-healing": ["prayer-for-healing", "panalangin-para-sa-pagpapagaling", "palve-tervise-eest"],
  "panalangin-para-sa-pagpapagaling": ["prayer-for-healing", "panalangin-para-sa-pagpapagaling", "palve-tervise-eest"],
  "palve-tervise-eest": ["prayer-for-healing", "panalangin-para-sa-pagpapagaling", "palve-tervise-eest"],

  // Prayer of Confession
  "prayer-of-confession": ["prayer-of-confession", "panalangin-ng-pagsisisi", "patukahetsuse-palve"],
  "panalangin-ng-pagsisisi": ["prayer-of-confession", "panalangin-ng-pagsisisi", "patukahetsuse-palve"],
  "patukahetsuse-palve": ["prayer-of-confession", "panalangin-ng-pagsisisi", "patukahetsuse-palve"],

  // Prayer of Thanksgiving
  "prayer-of-thanksgiving": ["prayer-of-thanksgiving", "panalangin-ng-pasasalamat", "tanupalve"],
  "panalangin-ng-pasasalamat": ["prayer-of-thanksgiving", "panalangin-ng-pasasalamat", "tanupalve"],
  "tanupalve": ["prayer-of-thanksgiving", "panalangin-ng-pasasalamat", "tanupalve"],

  // Prayer for Family
  "prayer-for-family": ["prayer-for-family", "panalangin-para-sa-pamilya", "palve-pere-eest"],
  "panalangin-para-sa-pamilya": ["prayer-for-family", "panalangin-para-sa-pamilya", "palve-pere-eest"],
  "palve-pere-eest": ["prayer-for-family", "panalangin-para-sa-pamilya", "palve-pere-eest"],

  // Prayer for World
  "prayer-for-world": ["prayer-for-world", "panalangin-para-sa-mundo", "palve-maailma-eest"],
  "panalangin-para-sa-mundo": ["prayer-for-world", "panalangin-para-sa-mundo", "palve-maailma-eest"],
  "palve-maailma-eest": ["prayer-for-world", "panalangin-para-sa-mundo", "palve-maailma-eest"],

  // Prayer for Strength
  "prayer-for-strength": ["prayer-for-strength", "panalangin-para-sa-lakas", "palve-jou-eest"],
  "panalangin-para-sa-lakas": ["prayer-for-strength", "panalangin-para-sa-lakas", "palve-jou-eest"],
  "palve-jou-eest": ["prayer-for-strength", "panalangin-para-sa-lakas", "palve-jou-eest"],

  // Prayer for Guidance
  "prayer-for-guidance": ["prayer-for-guidance", "panalangin-para-sa-gabay", "palve-juhenduse-eest"],
  "panalangin-para-sa-gabay": ["prayer-for-guidance", "panalangin-para-sa-gabay", "palve-juhenduse-eest"],
  "palve-juhenduse-eest": ["prayer-for-guidance", "panalangin-para-sa-gabay", "palve-juhenduse-eest"],

  // Serenity Prayer (only in English currently)
  "serenity-prayer": ["serenity-prayer"],

  // Angelus (only in Tagalog currently)
  "angelus": ["angelus"],

  // Luther's Morning Prayer (only in Estonian currently)
  "lutheri-hommikupalve": ["lutheri-hommikupalve"],
};

/**
 * Get the prayer ID for a specific language, given any equivalent prayer ID
 * @param prayerId - Any prayer ID from any language
 * @param targetLanguage - The language code to get the prayer ID for
 * @returns The prayer ID for the target language, or the original ID if no mapping exists
 */
export function getMappedPrayerId(prayerId: string, targetLanguage: string): string {
  // Find the mapping group that contains the given prayer ID
  const mappingGroup = PRAYER_ID_MAPPINGS[prayerId];
  
  if (!mappingGroup) {
    // No mapping found, return original ID
    return prayerId;
  }

  // Language-specific ID patterns
  const languagePatterns = {
    'en': (id: string) => isEnglishId(id),
    'tl': (id: string) => isTagalogId(id), 
    'et': (id: string) => isEstonianId(id)
  };

  // Find the ID for the target language
  const targetId = mappingGroup.find(id => {
    const pattern = languagePatterns[targetLanguage as keyof typeof languagePatterns];
    return pattern ? pattern(id) : false;
  });

  return targetId || prayerId;
}

/**
 * Check if a prayer ID is in English
 */
function isEnglishId(id: string): boolean {
  const englishIds = [
    'lords-prayer',
    'gloria-patri',
    'apostles-creed',
    'come-holy-spirit',
    'morning-prayer',
    'evening-prayer',
    'prayer-for-spiritual-gifts',
    'prayer-before-communion',
    'prayer-before-meals',
    'prayer-for-peace',
    'prayer-for-healing',
    'prayer-of-confession',
    'prayer-of-thanksgiving',
    'serenity-prayer',
    'prayer-for-guidance',
    'prayer-for-family',
    'prayer-for-world',
    'prayer-for-strength'
  ];
  return englishIds.includes(id);
}

/**
 * Check if a prayer ID is in Tagalog
 */
function isTagalogId(id: string): boolean {
  const tagalogIds = [
    'ama-namin',
    'luwalhati-sa-diyos', 
    'sumasampalataya-ako',
    'panalangin-sa-umaga',
    'panalangin-sa-gabi',
    'panalangin-bago-kumain',
    'panalangin-para-sa-kapayapaan',
    'panalangin-para-sa-pagpapagaling',
    'panalangin-ng-pagsisisi',
    'panalangin-ng-pasasalamat',
    'panalangin-para-sa-pamilya',
    'panalangin-para-sa-mundo',
    'panalangin-para-sa-lakas',
    'panalangin-para-sa-gabay',
    'angelus'
  ];
  return tagalogIds.includes(id);
}

/**
 * Check if a prayer ID is in Estonian
 */
function isEstonianId(id: string): boolean {
  const estonianIds = [
    'meie-isa',
    'au-olgu-isale',
    'apostlite-uskutunnistus',
    'hommikupalve',
    'ohtupalve',
    'palve-enne-sooki',
    'palve-rahu-eest',
    'palve-tervise-eest',
    'patukahetsuse-palve',
    'tanupalve',
    'palve-pere-eest',
    'palve-maailma-eest',
    'palve-jou-eest',
    'palve-juhenduse-eest',
    'lutheri-hommikupalve'
  ];
  return estonianIds.includes(id);
}

/**
 * Get all equivalent prayer IDs for a given prayer ID
 * @param prayerId - Any prayer ID from any language
 * @returns Array of all equivalent prayer IDs across languages
 */
export function getAllEquivalentPrayerIds(prayerId: string): string[] {
  return PRAYER_ID_MAPPINGS[prayerId] || [prayerId];
}
