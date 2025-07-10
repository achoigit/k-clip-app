
import { Flashcard } from '../types';

export const updateFlashcardReview = (
  card: Flashcard,
  performance: 'easy' | 'good' | 'hard'
): Flashcard => {
  let { easeFactor, interval } = card;

  if (performance === 'hard') {
    interval = 1; // Reset to 1 day
  } else {
    if (card.status === 'new') {
      interval = 1;
    } else if (card.status === 'learning') {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  if (performance === 'easy') {
    easeFactor += 0.15;
  } else if (performance === 'hard') {
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  let status: 'learning' | 'mastered' = 'learning';
  if (interval > 30) { // Consider mastered if next review is more than a month away
    status = 'mastered';
  }

  return {
    ...card,
    easeFactor,
    interval,
    nextReview,
    lastReviewed: new Date(),
    status,
  };
};
