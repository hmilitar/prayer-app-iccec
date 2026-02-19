// Daily Reading data types based on technical specification

import { SupportedLanguage } from './Prayer';

export interface DailyReading {
  id: string;
  date: string; // ISO date string
  title: string;
  readings: Reading[];
  reflection?: string;
  language: SupportedLanguage;
  metadata: {
    liturgicalSeason?: string;
    feast?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Reading {
  id: string;
  type: ReadingType;
  reference: string; // e.g., "John 3:16-21"
  text: string;
  title?: string;
}

export enum ReadingType {
  OLD_TESTAMENT = 'old_testament',
  PSALM = 'psalm',
  NEW_TESTAMENT = 'new_testament',
  GOSPEL = 'gospel',
  DEVOTIONAL = 'devotional'
}

/**
 * Map supported app languages to the best available BibleGateway Bible version.
 * Falls back to NKJV when a language has no native BibleGateway translation.
 */
const BIBLE_VERSION_MAP: Readonly<Record<string, string>> = {
  en: 'NKJV',      // New King James Version
  tl: 'MBBTAG',    // Magandang Balita Biblia (Tagalog)
  et: 'NKJV',      // No Estonian on BibleGateway — fallback to English
  es: 'RVR1960',   // Reina-Valera 1960
  it: 'CEI',       // Conferenza Episcopale Italiana
  fr: 'LSG',       // Louis Segond
  de: 'LUTH1545',  // Luther Bible 1545
  pl: 'UBG',       // Updated Gdańsk Bible
  ru: 'SYNOD',     // Synodal Translation (Russian)
  nl: 'HTB',       // Het Boek (Dutch)
  pt: 'ARC',       // Almeida Revista e Corrigida (Portuguese)
  sv: 'SFB',       // Svenska Folkbibeln (Swedish)
  ro: 'NTLR',      // Noua Traducere În Limba Română (Romanian)
};

/**
 * Human-readable display names for each BibleGateway version code.
 */
export const BIBLE_VERSION_NAMES: Readonly<Record<string, string>> = {
  NKJV: 'New King James Version',
  MBBTAG: 'Magandang Balita Biblia',
  RVR1960: 'Reina-Valera 1960',
  CEI: 'Conferenza Episcopale Italiana',
  LSG: 'Louis Segond',
  LUTH1545: 'Luther Bibel 1545',
  UBG: 'Updated Gdańsk Bible',
  SYNOD: 'Синодальный перевод',
  HTB: 'Het Boek',
  ARC: 'Almeida Revista e Corrigida',
  SFB: 'Svenska Folkbibeln',
  NTLR: 'Noua Traducere În Limba Română',
};

/**
 * Resolve the preferred BibleGateway version for a given language code.
 */
export function getBibleVersionForLanguage(language?: string): string {
  return BIBLE_VERSION_MAP[language ?? 'en'] ?? 'NKJV';
}

/**
 * Build a Bible Gateway URL for a given scripture reference.
 *
 * @param reference - Human-readable reference, e.g. "John 3:16-21"
 * @param languageOrVersion - Either a 2-letter app language code (auto-resolves
 *   to a BibleGateway version) or an explicit version code like 'NKJV'.
 *   Defaults to NKJV.
 */
export function getBibleGatewayUrl(
  reference: string,
  languageOrVersion: string = 'NKJV'
): string {
  // If the caller passed a 2-letter language code, resolve it
  const version =
    languageOrVersion.length <= 3 && BIBLE_VERSION_MAP[languageOrVersion]
      ? BIBLE_VERSION_MAP[languageOrVersion]
      : languageOrVersion;

  const encoded = encodeURIComponent(reference);
  return `https://www.biblegateway.com/passage/?search=${encoded}&version=${version}`;
}