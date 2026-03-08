
import React from 'react';
import { Card, ProgressBar, Row, Col, Button } from 'react-bootstrap';
import { Flashcard } from '../types';

interface Props {
  flashcards: Flashcard[];
  reviewSessionMode: 'none' | 'due' | 'difficult';
  onStartDueReview: () => void;
  onStartDifficultReview: () => void;
  onBackToLibrary: () => void;
}

const Dashboard: React.FC<Props> = ({
  flashcards,
  reviewSessionMode,
  onStartDueReview,
  onStartDifficultReview,
  onBackToLibrary,
}) => {
  const totalCards = flashcards.length;
  const newCards = flashcards.filter(card => card.status === 'new').length;
  const learningCards = flashcards.filter(card => card.status === 'learning').length;
  const masteredCards = flashcards.filter(card => card.status === 'mastered').length;
  const dueCardsCount = flashcards.filter(card => new Date(card.nextReview) <= new Date()).length;

  const masteredPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title className="mb-3">Learning Progress</Card.Title>
        <ProgressBar className="mb-3">
          <ProgressBar striped variant="success" now={masteredPercentage} key={1} label={`${masteredPercentage}%`} />
        </ProgressBar>
        <Row>
          <Col>
            <div className="text-center">
              <h5>{totalCards}</h5>
              <p className="text-muted stat-label">Total</p>
            </div>
          </Col>
          <Col>
            <div className="text-center">
              <h5>{newCards}</h5>
              <p className="text-muted stat-label">New</p>
            </div>
          </Col>
          <Col>
            <div className="text-center">
              <h5>{learningCards}</h5>
              <p className="text-muted stat-label">Learning</p>
            </div>
          </Col>
          <Col>
            <div className="text-center">
              <h5>{masteredCards}</h5>
              <p className="text-muted stat-label">Mastered</p>
            </div>
          </Col>
        </Row>
        <div className="d-grid gap-2 mt-3">
          {reviewSessionMode === 'none' ? (
            <>
              {dueCardsCount > 0 ? (
                <Button variant="outline-primary" onClick={onStartDueReview}>
                  Start Due Review
                </Button>
              ) : (
                <p className="text-muted stat-label mb-0">No reviews due today!</p>
              )}
              <Button variant="outline-primary" onClick={onStartDifficultReview} disabled={flashcards.length === 0}>
                Review 10 Most Difficult Phrases
              </Button>
            </>
          ) : (
            <Button variant="outline-secondary" onClick={onBackToLibrary}>
              Back to Library
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;
