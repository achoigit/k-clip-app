
import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { Flashcard } from '../types';

interface Props {
  flashcards: Flashcard[];
  onReview: (card: Flashcard, performance: 'easy' | 'good' | 'hard') => void;
}

const ReviewPage: React.FC<Props> = ({ flashcards, onReview }) => {
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const today = new Date();
    const due = flashcards.filter(card => new Date(card.nextReview) <= today);
    setDueCards(due);
  }, [flashcards]);

  const handlePerformance = (performance: 'easy' | 'good' | 'hard') => {
    onReview(dueCards[currentCardIndex], performance);
    setShowAnswer(false);
    setCurrentCardIndex(prev => prev + 1);
  };

  if (dueCards.length === 0) {
    return <p>No reviews due today!</p>;
  }

  if (currentCardIndex >= dueCards.length) {
    return <p>All reviews for today are complete!</p>;
  }

  const currentCard = dueCards[currentCardIndex];

  return (
    <Container>
      <Card>
        <Card.Body>
          <Card.Title>{currentCard.koreanPhrase}</Card.Title>
          {showAnswer && (
            <Card.Text className="text-muted">{currentCard.englishTranslation}</Card.Text>
          )}
          {!showAnswer && (
            <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
          )}
          {showAnswer && (
            <div>
              <Button variant="danger" onClick={() => handlePerformance('hard')}>Hard</Button>
              <Button variant="warning" onClick={() => handlePerformance('good')}>Good</Button>
              <Button variant="success" onClick={() => handlePerformance('easy')}>Easy</Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReviewPage;
