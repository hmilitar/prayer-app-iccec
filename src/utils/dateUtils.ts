// Date utility functions

/**
 * Format a date to ISO string (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date as ISO string
 */
export function getTodayISO(): string {
  return formatDateToISO(new Date());
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateToISO(date1) === formatDateToISO(date2);
}

/**
 * Get the next day from a given date
 */
export function getNextDay(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
}

/**
 * Get the previous day from a given date
 */
export function getPreviousDay(date: Date): Date {
  const previousDay = new Date(date);
  previousDay.setDate(previousDay.getDate() - 1);
  return previousDay;
}

/**
 * Get a range of dates between start and end (inclusive)
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Get the liturgical year for a given date
 * Liturgical year starts on the first Sunday of Advent
 */
export function getLiturgicalYear(date: Date): number {
  const year = date.getFullYear();
  const advent = getFirstSundayOfAdvent(year);
  
  // If date is before Advent, it's still the previous liturgical year
  if (date < advent) {
    return year;
  }
  
  return year + 1;
}

/**
 * Get the first Sunday of Advent for a given year
 */
export function getFirstSundayOfAdvent(year: number): Date {
  // Advent starts on the Sunday closest to November 30
  // (between November 27 and December 3)
  const christmas = new Date(year, 11, 25); // December 25
  const dayOfWeek = christmas.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate days back to the 4th Sunday before
  const daysBack = dayOfWeek === 0 ? 28 : (dayOfWeek + 21);
  
  const advent = new Date(christmas);
  advent.setDate(christmas.getDate() - daysBack);
  
  return advent;
}

/**
 * Get the liturgical season for a given date
 */
export function getLiturgicalSeason(date: Date): string {
  const year = date.getFullYear();

  // Fixed windows that can span year boundaries
  const adventStart = getFirstSundayOfAdvent(year); // Advent at end of this calendar year
  const christmasStartPrev = new Date(year - 1, 11, 25); // Dec 25 of previous year
  const epiphanyCurrent = new Date(year, 0, 6); // Jan 6 of current year
  const christmasStartCurrent = new Date(year, 11, 25); // Dec 25 of current year
  const epiphanyNext = new Date(year + 1, 0, 6); // Jan 6 of next year

  // Movable feasts for this calendar year
  const easter = getEasterDate(year);
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  // Christmas season can be late Dec (current year) or early Jan (spillover from previous year)
  if (date >= christmasStartCurrent && date < epiphanyNext) {
    return 'Christmas';
  }
  if (date >= christmasStartPrev && date < epiphanyCurrent) {
    return 'Christmas';
  }

  // Advent is from the first Sunday of Advent until Christmas (same calendar year)
  if (date >= adventStart && date < christmasStartCurrent) {
    return 'Advent';
  }

  // Lent and Easter windows within this calendar year
  if (date >= ashWednesday && date < easter) {
    return 'Lent';
  }
  if (date >= easter && date < pentecost) {
    return 'Easter';
  }

  // Everything else is Ordinary Time
  return 'Ordinary';
}

/**
 * Calculate Easter date for a given year using the algorithm
 */
export function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

/**
 * Format date for display based on locale
 */
export function formatDisplayDate(date: Date, locale: string = 'en'): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 days")
 */
export function getRelativeTimeString(date: Date, baseDate: Date = new Date()): string {
  const diffInMs = date.getTime() - baseDate.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow';
  } else if (diffInDays === -1) {
    return 'Yesterday';
  } else if (diffInDays > 0) {
    return `In ${diffInDays} days`;
  } else {
    return `${Math.abs(diffInDays)} days ago`;
  }
}