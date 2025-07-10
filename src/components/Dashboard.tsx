
import React from 'react';
import { Card, ProgressBar, Row, Col } from 'react-bootstrap';
import { Flashcard } from '../types';

interface Props {
  flashcards: Flashcard[];
}

const Dashboard: React.FC<Props> = ({ flashcards }) => {
  const totalCards = flashcards.length;
  const newCards = flashcards.filter(card => card.status === 'new').length;
  const learningCards = flashcards.filter(card => card.status === 'learning').length;
  const masteredCards = flashcards.filter(card => card.status === 'mastered').length;

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
              <p className="text-muted">Total</p>
            </div>
          </Col>
          <Col>
            <div className="text-center">
              <h5>{newCards}</h5>
              <p className="text-muted">New</p>
            </div>
          </Col>
          <Col>
            <div className="text-center">
              <h5>{learningCards}</h5>
              <p className="text-muted">Learning</p>
            </div>
          </Col>
          <Col>
            <div className="text-center">
              <h5>{masteredCards}</h5>
              <p className="text-muted">Mastered</p>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;
