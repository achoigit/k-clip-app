
import React from 'react';
import { Flashcard } from '../types';
import { translateText } from '../services/translation';
import FlashcardFormCard from './FlashcardFormCard';

interface Props {
  addFlashcard: (card: Omit<Flashcard, 'id' | 'lastReviewed' | 'nextReview' | 'interval' | 'easeFactor' | 'status'>) => void;
  editingCard: Flashcard | null;
  onUpdateFlashcard: (updatedCard: Flashcard) => void;
  onCancelEdit: () => void;
}

const FlashcardCreator: React.FC<Props> = ({ addFlashcard, editingCard, onUpdateFlashcard, onCancelEdit }) => {
  const isEditing = Boolean(editingCard);

  return (
    <FlashcardFormCard
      title={isEditing ? 'Edit Flashcard' : 'Create a New Flashcard'}
      submitLabel={isEditing ? 'Save Changes' : 'Create Card'}
      submittingLabel={isEditing ? 'Saving...' : 'Creating...'}
      initialValues={{
        youtubeUrl: editingCard?.youtubeUrl ?? '',
        startTime: editingCard ? String(editingCard.startTime) : '',
        endTime: editingCard ? String(editingCard.endTime) : '',
        koreanPhrase: editingCard?.koreanPhrase ?? '',
        englishTranslation: editingCard?.englishTranslation ?? '',
      }}
      resetOnSubmit={!isEditing}
      onCancel={isEditing ? onCancelEdit : undefined}
      showTranslationField={isEditing}
      onSubmit={async ({ koreanPhrase, englishTranslation, youtubeUrl, startTimeInSeconds, endTimeInSeconds, thumbnailUrl }) => {
        if (editingCard) {
          onUpdateFlashcard({
            ...editingCard,
            koreanPhrase,
            englishTranslation,
            youtubeUrl,
            startTime: startTimeInSeconds,
            endTime: endTimeInSeconds,
            thumbnailUrl,
          });
          onCancelEdit();
          return;
        }

        const translatedText = await translateText(koreanPhrase);

        addFlashcard({
          koreanPhrase,
          englishTranslation: translatedText,
          youtubeUrl,
          startTime: startTimeInSeconds,
          endTime: endTimeInSeconds,
          thumbnailUrl,
        });
      }}
    />
  );
};

export default FlashcardCreator;
