<<<<<<< HEAD
export interface ReadingSection {
  reference?: string;
  text: string;
  title?: string;
}

export interface Canticle {
  reference?: string;
  text: string;
  title?: string;
}

export interface PrayersSection {
  lordsPrayer?: string;
  prayerToStMichael?: string;
  collect?: string;
}

export interface LiturgicalDevotion {
  id?: string;
  date: string;
  timeOfDay: 'morning' | 'noon' | 'evening' | 'family';
  title?: string;
  signOfTheCross?: string;
  confession?: string;
  psalmForTheDay?: ReadingSection;
  gloriaPatri?: string;
  readings?: {
    oldTestament?: ReadingSection;
    canticle1?: Canticle;
    newTestament?: ReadingSection;
    canticle2?: Canticle;
    gospel?: ReadingSection;
  };
  apostlesCreed?: string;
  prayers?: PrayersSection;
  signOfTheCrossEnd?: string;
  reflection?: string;
  metadata?: {
    liturgicalSeason?: string;
    feast?: string;
    source?: string;
    sourceReference?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

=======
>>>>>>> 828180ffeabee9906add19b3bcf9df32c2115fa0
export interface DailyDevotion {
  id?: string;
  date: string;
  timeOfDay: 'morning' | 'noon' | 'evening' | 'family';
  title?: string;
  verse?: string;
  content: string;
  scripture?: string;
  prayer?: string;
}

export interface DevotionDay {
  date: string;
<<<<<<< HEAD
  morning?: LiturgicalDevotion;
  evening?: LiturgicalDevotion;
  noon?: LiturgicalDevotion;
  family?: LiturgicalDevotion;
=======
  morning?: DailyDevotion;
  evening?: DailyDevotion;
  noon?: DailyDevotion;
  family?: DailyDevotion;
>>>>>>> 828180ffeabee9906add19b3bcf9df32c2115fa0
}
