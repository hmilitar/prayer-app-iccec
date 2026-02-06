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
}export function getBibleGatewayUrl(ref: string) { return ''; }
