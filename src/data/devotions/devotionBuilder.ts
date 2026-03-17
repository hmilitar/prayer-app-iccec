/**
 * Devotion Builder — generates a complete DailyDevotion from lectionary + fixed prayers
 *
 * Based on ICCEC Prayer Guide (pages 8-20):
 *   Sign of the Cross → Confession → Psalm → Gloria Patri →
 *   Readings (1st, Canticle, 2nd, Canticle, Gospe *   Apostles Creed → Prayers → Lord's Prayer →
 *   Prayer to St. Michael → Collect of the Day → Sign of the Cross
 */

import {
  DailyDevotion,
  DevotionDay,
  DevotionSection,
  DevotionReading,
  DevotionTimeOfDay,
  LectionaryEntry,
} from '../../types/Devotion';
import { SupportedLanguage } from '../../types/Prayer';
import { getLiturgicalSeason } from '../../utils/dateUtils';
import { lectionary2026 } from '../lectionary/lectionary2026';
import { LocalizationService } from '../../services/LocalizationService';

// Import prayer JSON data for all supported languages
import prayersEn from '../prayers/en.json';
import prayersTl from '../prayers/tl.json';
import prayersEt from '../prayers/et.json';
import prayersEs from '../prayers/es.json';
import prayersIt from '../prayers/it.json';
import prayersFr from '../prayers/fr.json';
import prayersDe from '../prayers/de.json';
import prayersPl from '../prayers/pl.json';
import prayersRu from '../prayers/ru.json';
import prayersNl from '../prayers/nl.json';
import prayersPt from '../prayers/pt.json';
import prayersSv from '../prayers/sv.json';
import prayersRo from '../prayers/ro.json';

// ===================================================================
// Prayer data lookup
// ===================================================================

type PrayerEntry = { id: string; content: string; [key: string]: unknown };
type PrayerFile = { prayers: PrayerEntry[] };

const prayersByLanguage: Record<SupportedLanguage, PrayerFile> = {
  en: prayersEn as PrayerFile,
  tl: prayersTl as PrayerFile,
  et: prayersEt as PrayerFile,
  es: prayersEs as PrayerFile,
  it: prayersIt as PrayerFile,
  fr: prayersFr as PrayerFile,
  de: prayersDe as PrayerFile,
  pl: prayersPl as PrayerFile,
  ru: prayersRu as PrayerFile,
  nl: prayersNl as PrayerFile,
  pt: prayersPt as PrayerFile,
  sv: prayersSv as PrayerFile,
  ro: prayersRo as PrayerFile,
};

/**
 * Find a prayer entry by ID in a given language's prayer array.
 * Returns undefined if not found.
 */
function findPrayerById(
  prayerId: string,
  language: SupportedLanguage,
): PrayerEntry | undefined {
  const langData = prayersByLanguage[language];
  if (!langData?.prayers || !Array.isArray(langData.prayers)) {
    return undefined;
  }
  return langData.prayers.find((p) => p.id === prayerId);
}

/**
 * Get prayer text by ID with cascading language fallback:
 *  1. Requested language
 *  2. English
 *  3. Hardcoded English defaults
 */
function getPrayerText(prayerId: string, language: SupportedLanguage): string {
  // 1. Try requested language
  const inLang = findPrayerById(prayerId, language);
  if (inLang?.content) {
    return inLang.content;
  }

  // 2. Fall back to English
  if (language !== 'en') {
    const inEn = findPrayerById(prayerId, 'en');
    if (inEn?.content) {
      return inEn.content;
    }
  }

  // 3. Hardcoded English defaults as absolute last resort
  const prayerDefaults: Readonly<Record<string, string>> = {
   'confession':
      "Almighty God, Father of our Lord Jesus Christ, maker of all things, judge of all people: We acknowledge and confess our manifold sins and wickedness, which we have committed by thought, word, and deed, against your divine Majesty, provoking your wrath and indignation against us. We earnestly repent, and are heartily sorry for these our wrongdoings; the remembrance of them is grievous to us, the burden of them is intolerable. Have mercy on us, have mercy on us, most merciful Father; for the sake of your Son our Lord Jesus Christ, forgive us all that is past; and grant that we may hereafter serve and please you in newness of life, to the honor and glory of your Name; through Jesus Christ our Lord. Amen.",
    'gloria-patri':
      'Glory be to the Father, and to the Son, and to the Holy Spirit: as it was in the beginning, is now, and ever shall be, world without end. Amen.',
    'benedictus':
      'Blessed be the Lord God of Israel, for he has come to his people and set them free; and has raised up for us a mighty Savior, born of the house of his servant David; as he spoke by the mouth of his holy prophets from of old: that we should be saved from our enemies and from the hand of all who hate us; to perform the mercy promised to our ancestors, and to remember his holy covenant; the oath which he swore to our father Abraham, to grant us: that we, being rescued from the hand of our enemies, might serve him without fear, in holiness and righteousness before him all the days of our life. And you, child, shall be called the prophet of the Most High; for you will go before the Lord to prepare his ways; to give knowledge of salvation to his people in the forgiveness of their sins, through the tender mercy of our God; whereby the dawn from on high shall come to us, to give light to those who sit in darkness and in the shadow of death, and to guide our feet into the way of peace.',
    'magnificat':
      'My soul magnifies the Lord, and my spirit rejoices in God my Savior. For he has looked with favor on the lowliness of his servant; for behold, from now on all generations will call me blessed. For the Mighty One has done great things for me, and holy is his Name. His mercy is for those who fear him from generation to generation. He has shown strength with his arm; he has scattered the proud in the imagination of their hearts. He has brought down the powerful from their thrones, and lifted up the lowly. He has filled the hungry with good things, and sent the rich away empty. He has helped his servant Israel, in remembrance of his mercy, as he promised to our ancestors, to Abraham and to his descendants forever.',
    'nunc-dimittis':
      'Lord, now let your servant depart in peace, according to your word; for my eyes have seen your salvation, which you have prepared in the presence of all peoples; a light to lighten the nations, and the glory of your people Israel.',
    'apostles-creed':
      'I believe in God, the Father Almighty, maker of heaven and earth; and in Jesus Christ his only Son our Lord; who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended to the dead. On the third day he rose again from the dead. He ascended into heaven, and is seated at the right hand of God the Father Almighty. From there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and the life everlasting. Amen.',
    'lords-prayer':
      "Our Father in heaven, hallowed be your Name, your kingdom come, your will be done, on earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. For yours is the kingdom, and the power, and the glory, for ever and ever. Amen.",
    'st-michael-prayer':
      'Holy Michael the Archangel, defend us in the day of battle. Be our safeguard against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do you, O Prince of the heavenly host, by the power of God, thrust into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.',
  };

  return prayerDefaults[prayerId] ?? '';
}

// ===================================================================
// Localization helper
// ===================================================================

/**
 * Wrap LocalizationService.translate() with a safe fallback.
 */
function t(key: string, fallback: string): string {
  try {
    const result = LocalizationService.getInstance().translate(key);
    if (result && result !== key) {
      return result;
    }
  } catch {
    // fall through
  }
  return fallback;
}

// ===================================================================
// Prayer section builders – language-aware
// ===================================================================

function getSignOfCross(_language: SupportedLanguage): DevotionSection {
  return {
    key: 'sign_of_cross',
    title: t('devotions.sections.signOfCross', 'Sign of the Cross'),
    content: t('devotions.content.signOfCross', '\u2720 In the Name of the Father, and of the Son, and of the Holy Spirit. Amen.'),
  };
}

function getConfession(language: SupportedLanguage): DevotionSection {
  return {
    key: 'confession',
    title: t('devotions.sections.confession', 'Confession'),
    content: getPrayerText('confession', language),
    rubric: t('devotions.rubrics.confessionRubric', 'The following confession may be said together:'),
  };
}

function getGloriaPatri(language: SupportedLanguage): DevotionSection {
  return {
    key: 'gloria_patri',
    title: 'Gloria Patri',
    content: getPrayerText('gloria-patri', language),
  };
}

function getBenedictus(language: SupportedLanguage): DevotionSection {
  return {
    key: 'canticle_benedictus',
    title: t('devotions.sections.benedictus', 'Canticle: Benedictus'),
    content: getPrayerText('benedictus', language),
    reference: 'Luke 1:68-79',
  };
}

function getMagnificat(language: SupportedLanguage): DevotionSection {
  return {
    key: 'canticle_magnificat',
    title: t('devotions.sections.magnificat', 'Canticle: Magnificat'),
    content: getPrayerText('magnificat', language),
    reference: 'Luke 1:46-55',
  };
}

function getNuncDimittis(language: SupportedLanguage): DevotionSection {
  return {
    key: 'canticle_nunc_dimittis',
    title: t('devotions.sections.nuncDimittis', 'Canticle: Nunc Dimittis'),
    content: getPrayerText('nunc-dimittis', language),
    reference: 'Luke 2:29-32',
  };
}

function getApostlesCreed(language: SupportedLanguage): DevotionSection {
  return {
    key: 'apostles_creed',
    title: t('devotions.sections.apostlesCreed', "Apostles' Creed"),
    content: getPrayerText('apostles-creed', language),
  };
}

function getLordsPrayer(language: SupportedLanguage): DevotionSection {
  return {
    key: 'lords_prayer',
    title: t('devotions.sections.lordsPlayer', "The Lord's Prayer"),
    content: getPrayerText('lords-prayer', language),
  };
}

function getStMichaelPrayer(language: SupportedLanguage): DevotionSection {
  return {
    key: 'prayer_st_michael',
    title: t('devotions.sections.stMichaelPrayer', 'Prayer to St. Michael'),
    content: getPrayerText('st-michael-prayer', language),
  };
}

function getSignOfClosing(_language: SupportedLanguage): DevotionSection {
  return {
    key: 'sign_of_cross_closing',
    title: t('devotions.sections.signOfCross', 'Sign of the Cross'),
    content: t('devotions.content.signOfCross', '\u2720 In the Name of the Father, and of the Son, and of the Holy Spirit. Amen.'),
  };
}

// ===================================================================
// Time-specific opening prayers
// ===================================================================

function getMorningOpening(_language: SupportedLanguage): DevotionSection {
  return {
    key: 'morning_opening',
    title: t('devotions.timeTitle.morningPrayer', 'Morning Prayer'),
    content: t(
      'devotions.content.morningOpening',
      "O Lord, open our lips.\nAnd our mouth shall proclaim your praise.\n\nGlory be to the Father, and to the Son, and to the Holy Spirit: as it was in the beginning, is now, and ever shall be, world without end. Amen.\n\nPraise the Lord.\nThe Lord's Name be praised.",
    ),
    rubric: t('devotions.rubrics.officiantBegins', 'The Officiant begins:'),
  };
}

function getMiddayOpening(_language: SupportedLanguage): DevotionSection {
  return {
    key: 'midday_opening',
    title: t('devotions.timeTitle.middayPrayer', 'Midday Prayer'),
    content: t(
      'devotions.content.middayOpening',
      'O God, make speed to save us.\nO Lord, make haste to help us.\n\nGlory be to the Father, and to the Son, and to the Holy Spirit: as it was in the beginning, is now, and ever shall be, world without end. Amen.',
    ),
    rubric: t('devotions.rubrics.officiantBegins', 'The Officiant begins:'),
  };
}

function getEveningOpening(_language: SupportedLanguage): DevotionSection {
  return {
    key: 'evening_opening',
    title: t('devotions.timeTitle.eveningPrayer', 'Evening Prayer'),
    content: t(
      'devotions.content.eveningOpening',
      "O Lord, open our lips.\nAnd our mouth shall proclaim your praise.\n\nGlory be to the Father, and to the Son, and to the Holy Spirit: as it was in the beginning, is now, and ever shall be, world without end. Amen.\n\nPraise the Lord.\nThe Lord's Name be praised.",
    ),
    rubric: t('devotions.rubrics.officiantBegins', 'The Officiant begins:'),
  };
}

function getFamilyOpening(_language: SupportedLanguage): DevotionSection {
  return {
    key: 'family_opening',
    title: t('devotions.timeTitle.familyDevotion', 'Family Devotion'),
    content: t(
      'devotions.content.familyOpening',
      'The Lord Almighty grant us a peaceful night and a perfect end.\nAmen.\n\nOur help is in the Name of the Lord;\nThe maker of heaven and earth.',
    ),
    rubric: t('devotions.rubrics.familyGathers', 'The family gathers and one member begins:'),
  };
}

function getPrayersSection(_language: SupportedLanguage): DevotionSection {
  return {
    key: 'prayers',
    title: t('devotions.sections.prayers', 'Prayers'),
    content: t(
      'devotions.content.prayersVersicles',
      'O Lord, hear our prayer;\nAnd let our cry come to you.\n\nLet us pray.',
    ),
    rubric: t('devotions.rubrics.freePrayerIntercessions', 'Here may follow free prayer and intercessions.'),
  };
}

// ===================================================================
// Builder helpers
// ===================================================================

function getLectionaryForDate(date: string): LectionaryEntry | undefined {
  return (lectionary2026 as Readonly<Record<string, LectionaryEntry>>)[date];
}

function buildReadings(entry: LectionaryEntry): DevotionReading[] {
  return [
    { label: t('devotions.readings.firstReading', 'First Reading'), reference: entry.firstReading, text: '', type: 'first_reading' },
    { label: t('devotions.readings.psalm', 'Psalm'), reference: entry.psalm, text: '', type: 'psalm' },
    { label: t('devotions.readings.secondReading', 'Second Reading'), reference: entry.secondReading, text: '', type: 'second_reading' },
    { label: t('devotions.readings.gospel', 'Gospel'), reference: entry.gospel, text: '', type: 'gospel' },
  ];
}

/**
 * Canticles placed after each reading based on the Daily Office tradition.
 * Morning  → Benedictus / Gloria Patri
 * Noon     → Gloria Patri / Gloria Patri
 * Evening  → Magnificat / Nunc Dimittis
 * Family   → Nunc Dimittis / Gloria Patri
 */
function getCanticles(
  timeOfDay: DevotionTimeOfDay,
  language: SupportedLanguage,
): { after1st: DevotionSection; after2nd: DevotionSection } {
  switch (timeOfDay) {
    case 'morning':
      return { after1st: getBenedictus(language), after2nd: getGloriaPatri(language) };
    case 'noon':
      return { after1st: getGloriaPatri(language), after2nd: getGloriaPatri(language) };
    case 'evening':
      return { after1st: getMagnificat(language), after2nd: getNuncDimittis(language) };
    case 'family':
      return { after1st: getNuncDimittis(language), after2nd: getGloriaPatri(language) };
    default:
      return { after1st: getGloriaPatri(language), after2nd: getGloriaPatri(language) };
  }
}

function getOpeningForTime(timeOfDay: DevotionTimeOfDay, language: SupportedLanguage): DevotionSection {
  switch (timeOfDay) {
    case 'morning': return getMorningOpening(language);
    case 'noon':    return getMiddayOpening(language);
    case 'evening': return getEveningOpening(language);
    case 'family':  return getFamilyOpening(language);
    default:        return getMorningOpening(language);
  }
}

function getTimeTitle(timeOfDay: DevotionTimeOfDay): string {
  switch (timeOfDay) {
    case 'morning': return t('devotions.timeTitle.morningPrayer', 'Morning Prayer');
    case 'noon':    return t('devotions.timeTitle.middayPrayer', 'Midday Prayer');
    case 'evening': return t('devotions.timeTitle.eveningPrayer', 'Evening Prayer');
    case 'family':  return t('devotions.timeTitle.familyDevotion', 'Family Devotion');
    default:        return t('devotions.timeTitle.prayer', 'Prayer');
  }
}

// ===================================================================
// Public API
// ===================================================================

/**
 * Build a single DailyDevotion for a given date, time of day, and language.
 * Returns null when the lectionary has no entry for the date.
 *
 * @param date      - ISO date string (YYYY-MM-DD)
 * @param timeOfDay - morning | noon | evening | family
 * @param language  - one of the 8 supported languages (default: 'en')
 */
export function buildDevotion(
  date: string,
  timeOfDay: DevotionTimeOfDay,
  language: SupportedLanguage = 'en',
): DailyDevotion | null {
  const entry = getLectionaryForDate(date);
  if (!entry) return null;

  const season = getLiturgicalSeason(new Date(date));
  const canticles = getCanticles(timeOfDay, language);

  const psalmSection: DevotionSection = {
    key: 'psalm',
    title: t('devotions.readings.psalm', 'Psalm'),
    content: entry.psalm,
    reference: entry.psalm,
  };

  const sections: DevotionSection[] = [
    getSignOfCross(language),
    getOpeningForTime(timeOfDay, language),
    getConfession(language),
    psalmSection,
    getGloriaPatri(language),
    {
      key: 'reading_1st_label',
      title: t('devotions.readings.firstReading', 'First Reading'),
      content: entry.firstReading,
      reference: entry.firstReading,
      rubric: t('devotions.rubrics.readingFromScripture', 'A Reading from Holy Scripture'),
    },
    canticles.after1st,
    {
      key: 'reading_2nd_label',
      title: t('devotions.readings.secondReading', 'Second Reading'),
      content: entry.secondReading,
      reference: entry.secondReading,
      rubric: t('devotions.rubrics.readingFromScripture', 'A Reading from Holy Scripture'),
    },
    canticles.after2nd,
    {
      key: 'reading_gospel_label',
      title: t('devotions.readings.gospel', 'Gospel'),
      content: entry.gospel,
      reference: entry.gospel,
      rubric: t('devotions.rubrics.holyGospel', 'The Holy Gospel'),
    },
    getApostlesCreed(language),
    getPrayersSection(language),
    getLordsPrayer(language),
    getStMichaelPrayer(language),
    getSignOfClosing(language),
  ];

  return {
    id: `${date}-${timeOfDay}`,
    date,
    timeOfDay,
    title: getTimeTitle(timeOfDay),
    language,
    sections,
    readings: buildReadings(entry),
    liturgicalSeason: season,
  };
}

/**
 * Build a full DevotionDay (morning, midday, evening, family) for a date.
 * Returns null if no lectionary data exists for the date.
 */
export function buildDevotionDay(
  date: string,
  language: SupportedLanguage = 'en',
): DevotionDay | null {
  if (!getLectionaryForDate(date)) return null;

  return {
    date,
    morning: buildDevotion(date, 'morning', language) ?? undefined,
    noon:    buildDevotion(date, 'noon',    language) ?? undefined,
    evening: buildDevotion(date, 'evening', language) ?? undefined,
    family:  buildDevotion(date, 'family',  language) ?? undefined,
  };
}

/**
 * Check whether lectionary data exists for a given date.
 */
export function hasLectionaryData(date: string): boolean {
  return date in lectionary2026;
}

/**
 * Return all dates in the lectionary as a sorted ISO string array.
 */
export function getLectionaryDates(): string[] {
  return Object.keys(lectionary2026).sort();
}
