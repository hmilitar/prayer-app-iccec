/**
 * Devotion data types for the ICCEC Daily Office
 * Based on the ICCEC Prayer Guide (pages 8-20)
 *
 * Outline for Morning, Midday, Evening, and Family devotions:
 * - Sign of the Cross
 * - Confession
 * - Psalm
 * - Gloria Patri
 * - Readings (1st Reading, Canticle, 2nd Reading, Canticle, Gospel)
 * - Apostles' Creed
 * - Prayers
 * - The Lord's Prayer
 * - Prayer to St. Michael
 * - Collect of the Day
 * - Sign of the Cross
 */

import { SupportedLanguage } from './Prayer';

/** A single devotion section (e.g., Sign of the Cross, Confession, etc.) */
export interface DevotionSection {
  /** Unique key for this section within the devotion */
  readonly key: string;
  /** Display title for the section */
  readonly title: string;
  /** Main textual content — may contain rubric markers like ✠ */
  readonly content: string;
  /** Optional scripture or liturgical reference */
  readonly reference?: string;
  /** Optional response text (e.g., congregation response) */
  readonly response?: string;
  /** Optional instruction/rubric text */
  readonly rubric?: string;
  /** Whether this section is optional */
  readonly optional?: boolean;
}

/** A single reading within the Daily Office */
export interface DevotionReading {
  /** Reading label (e.g., "First Reading", "Psalm", "Gospel") */
  readonly label: string;
  /** Scripture reference (e.g., "Joel 2:1-2,12-17") */
  readonly reference: string;
  /** Full text content of the reading */
  readonly text: string;
  /** Reading type for display purposes */
  readonly type: DevotionReadingType;
}

/** Possible reading types in the Daily Office */
export type DevotionReadingType =
  | 'first_reading'
  | 'psalm'
  | 'second_reading'
  | 'gospel'
  | 'canticle';

/** A complete Daily Devotion for a specific time of day */
export interface DailyDevotion {
  /** Unique identifier (e.g., "2026-02-18-morning") */
  readonly id: string;
  /** ISO date string (e.g., "2026-02-18") */
  readonly date: string;
  /** Time of day for this devotion */
  readonly timeOfDay: DevotionTimeOfDay;
  /** Display title (e.g., "Morning Prayer - Ash Wednesday") */
  readonly title: string;
  /** Language of this devotion content */
  readonly language: SupportedLanguage;
  /** Ordered sections forming the devotion outline */
  readonly sections: DevotionSection[];
  /** Scripture readings for the day */
  readonly readings: DevotionReading[];
  /** Collect (prayer) of the day */
  readonly collectOfTheDay?: string;
  /** Liturgical season context */
  readonly liturgicalSeason?: string;
  /** Optional feast or commemoration name */
  readonly feast?: string;
}

/** Valid times of day for devotions */
export type DevotionTimeOfDay = 'morning' | 'noon' | 'evening' | 'family';

/** A full day's worth of devotions */
export interface DevotionDay {
  /** ISO date string */
  readonly date: string;
  /** Morning office */
  readonly morning?: DailyDevotion;
  /** Midday office */
  readonly noon?: DailyDevotion;
  /** Evening office */
  readonly evening?: DailyDevotion;
  /** Family devotion */
  readonly family?: DailyDevotion;
}

/** Daily lectionary entry — maps a date to its 4 readings */
export interface LectionaryEntry {
  /** 1st Reading reference (OT / Epistle) */
  readonly firstReading: string;
  /** Psalm reference */
  readonly psalm: string;
  /** 2nd Reading reference (NT Epistle) */
  readonly secondReading: string;
  /** Gospel reference */
  readonly gospel: string;
}

/** Map of ISO date strings to lectionary entries */
export type LectionaryData = Readonly<Record<string, LectionaryEntry>>;
