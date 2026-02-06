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
  morning?: DailyDevotion;
  evening?: DailyDevotion;
  noon?: DailyDevotion;
  family?: DailyDevotion;
}
