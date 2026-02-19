// Navigation types based on technical specification

// Root stack navigator (contains tabs and detail screens)
export type RootStackParamList = {
  Main: undefined;
  PrayerDetail: { prayerId: string };
};

// Tab navigator within the main screen
export type TabParamList = {
  Home: undefined;
  DailyReadings: { timeOfDay?: 'morning' | 'noon' | 'evening' | 'family' } | undefined;
  Prayers: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  PrayerDetail: { prayerId: string };
};

export type PrayersStackParamList = {
  PrayersList: undefined;
  PrayerDetail: { prayerId: string };
  PrayerCategory: { categoryId: string };
};

export type ReadingsStackParamList = {
  ReadingsList: undefined;
  ReadingDetail: { readingId: string; date?: string };
};