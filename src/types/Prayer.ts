// Prayer data types based on technical specification

export interface Prayer {
  id: string;
  title: string;
  category: PrayerCategory;
  content: string;
  source?: string;
  tags: string[];
  language: SupportedLanguage;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

export enum PrayerCategory {
  LITURGICAL = 'liturgical',
  CONTEMPORARY = 'contemporary',
  PERSONAL = 'personal',
  INTERCESSION = 'intercession',
  THANKSGIVING = 'thanksgiving',
  CONFESSION = 'confession'
}

export type SupportedLanguage = 'en' | 'tl' | 'et';