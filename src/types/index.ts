
export interface Flashcard {
  id: string;
  koreanPhrase: string;
  englishTranslation: string;
  youtubeUrl: string;
  startTime: number;
  endTime: number;
  thumbnailUrl: string;
  lastReviewed: Date | null;
  nextReview: Date;
  interval: number; // in days
  easeFactor: number;
  status: 'new' | 'learning' | 'mastered';
}
