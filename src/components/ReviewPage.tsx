
import React, { useState, useEffect } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { Flashcard } from '../types';
import VideoPlayer from './VideoPlayer';
import { getYoutubeVideoId } from '../utils/youtube';
import { Play } from 'react-bootstrap-icons';

interface Props {
  flashcards: Flashcard[];
  onReview: (card: Flashcard, performance: 'easy' | 'okay' | 'hard') => void;
  mode: 'due' | 'difficult';
  onExit: () => void;
}

const shuffleCards = (cards: Flashcard[]): Flashcard[] => {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const getDifficultyScore = (card: Flashcard): number => {
  const statusWeight = card.status === 'learning' ? 2 : card.status === 'new' ? 1 : 0;
  return (3 - card.easeFactor) * 10 + statusWeight * 5 - card.interval;
};

const ReviewPage: React.FC<Props> = ({ flashcards, onReview, mode, onExit }) => {
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [performanceSelection, setPerformanceSelection] = useState<'easy' | 'okay' | 'hard' | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    if (sessionCards.length > 0 || currentCardIndex > 0) {
      return;
    }

    if (mode === 'due') {
      const today = new Date();
      const due = flashcards.filter(card => new Date(card.nextReview) <= today);
      setSessionCards(due);
    } else {
      const hardestCards = flashcards
        .filter(card => card.status !== 'mastered')
        .sort((a, b) => getDifficultyScore(b) - getDifficultyScore(a))
        .slice(0, 10);
      setSessionCards(shuffleCards(hardestCards));
    }

    setCurrentCardIndex(0);
    setShowAnswer(false);
    setPerformanceSelection(null);
    setShowVideoPlayer(false);
  }, [mode, flashcards, currentCardIndex, sessionCards.length]);

  const handleNextCard = () => {
    if (performanceSelection === null) {
      return;
    }

    onReview(sessionCards[currentCardIndex], performanceSelection);
    setShowAnswer(false);
    setPerformanceSelection(null);
    setShowVideoPlayer(false);
    setCurrentCardIndex(prev => prev + 1);
  };

  if (sessionCards.length === 0) {
    return (
      <Container>
        <p className="mt-3 text-muted review-meta">
          {mode === 'due' ? 'No reviews due today!' : 'No phrases available for difficult review yet.'}
        </p>
        <Button variant="outline-secondary" onClick={onExit}>Back to Library</Button>
      </Container>
    );
  }

  if (currentCardIndex >= sessionCards.length) {
    return (
      <Container>
        <p className="mt-3 text-muted review-meta">Review session complete!</p>
        <Button variant="outline-secondary" onClick={onExit}>Back to Library</Button>
      </Container>
    );
  }

  const currentCard = sessionCards[currentCardIndex];
  const videoId = getYoutubeVideoId(currentCard.youtubeUrl) || '';

  return (
    <Container>
      <Card>
        <Card.Body>
          <Card.Subtitle className="mb-2 text-muted review-meta">
            {mode === 'difficult' ? 'Difficult Review Session' : 'Due Review Session'}
          </Card.Subtitle>
          <Card.Text className="text-muted review-meta mb-2">
            Card {currentCardIndex + 1} of {sessionCards.length}
          </Card.Text>
          <Card.Title>{currentCard.koreanPhrase}</Card.Title>
          {showAnswer && (
            <Card.Text className="text-muted translation-text">{currentCard.englishTranslation}</Card.Text>
          )}
          {!showAnswer && (
            <Button className="review-action-btn" onClick={() => setShowAnswer(true)}>Reveal Translation</Button>
          )}
          {showAnswer && (
            <div className="d-grid gap-2 review-action-stack">
              <div className="position-relative media-frame mb-2">
                <Card.Img className="media-thumb" variant="top" src={currentCard.thumbnailUrl} />
                <div className="position-absolute top-50 start-50 translate-middle">
                  <Button className="video-play-button" variant="light" onClick={() => setShowVideoPlayer(true)} disabled={!videoId}>
                    <Play size={32} />
                  </Button>
                </div>
              </div>
              <Button
                className="review-action-btn"
                variant={performanceSelection === 'easy' ? 'success' : 'outline-success'}
                onClick={() => setPerformanceSelection('easy')}
              >
                Easy
              </Button>
              <Button
                className="review-action-btn"
                variant={performanceSelection === 'okay' ? 'warning' : 'outline-warning'}
                onClick={() => setPerformanceSelection('okay')}
              >
                Okay
              </Button>
              <Button
                className="review-action-btn"
                variant={performanceSelection === 'hard' ? 'danger' : 'outline-danger'}
                onClick={() => setPerformanceSelection('hard')}
              >
                Hard
              </Button>
              <Button className="review-action-btn" variant="primary" onClick={handleNextCard} disabled={performanceSelection === null}>
                Next Phrase
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
      <VideoPlayer
        show={showVideoPlayer}
        onHide={() => setShowVideoPlayer(false)}
        videoId={videoId}
        startTime={currentCard.startTime}
        endTime={currentCard.endTime}
      />
    </Container>
  );
};

export default ReviewPage;
