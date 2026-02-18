/**
 * Liturgical season helper that returns both season name and its associated color.
 *
 * This module wraps the core `getLiturgicalSeason(date)` function from dateUtils
 * and adds color information needed by the theme system.
 *
 * Colour mapping follows traditional Western liturgical usage:
 *   - Advent / Lent → purple
 *   - Christmas / Easter → gold (white)
 *   - Ordinary Time → green
 *   - Pentecost → red
 */

import { getLiturgicalSeason as getSeasonName } from './dateUtils';

/** Liturgical season information used by the theme system */
export interface LiturgicalSeasonInfo {
  /** Canonical season name (e.g. 'Advent', 'Lent', 'Ordinary') */
  readonly season: string;
  /** Liturgical colour key consumed by LiturgicalColors palette */
  readonly color: 'purple' | 'gold' | 'green' | 'red' | 'white';
}

/**
 * Map each liturgical season to its liturgical color keyword.
 *
 * The keywords match the keys defined in `LiturgicalColors` (styles/liturgicalColors.ts).
 */
const SEASON_COLOR_MAP: Readonly<Record<string, LiturgicalSeasonInfo['color']>> = {
  Advent: 'purple',
  Lent: 'purple',
  Christmas: 'gold',
  Easter: 'gold',
  Ordinary: 'green',
  Pentecost: 'red',
};

/**
 * Returns the liturgical season name and its liturgical color for the given date.
 *
 * @param date - The calendar date to classify.
 * @returns An object with `season` (string) and `color` (colour keyword).
 *
 * @example
 * ```ts
 * const { season, color } = getLiturgicalSeason(new Date());
 * // { season: 'Lent', color: 'purple' }
 * ```
 */
export function getLiturgicalSeason(date: Date): LiturgicalSeasonInfo {
  try {
    const season = getSeasonName(date);
    const color = SEASON_COLOR_MAP[season] ?? 'green';
    return { season, color };
  } catch {
    // Defensive: never let date math crash the theme system
    return { season: 'Ordinary', color: 'green' };
  }
}
