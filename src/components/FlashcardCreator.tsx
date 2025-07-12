
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Flashcard } from '../types';
import { getYoutubeVideoId } from '../utils/youtube';
import { translateText } from '../services/translation';
import CustomJamoKeyboard from './CustomJamoKeyboard'; // Import the interactive keyboard
import { Keyboard as KeyboardIcon } from 'react-bootstrap-icons';

interface Props {
  addFlashcard: (card: Omit<Flashcard, 'id' | 'lastReviewed' | 'nextReview' | 'interval' | 'easeFactor' | 'status'>) => void;
}

const parseTimeToSeconds = (time: string): number => {
  const parts = time.split(':').map(Number);
  if (parts.some(isNaN)) return NaN;

  let seconds = 0;
  if (parts.length === 2) { // MM:SS
    seconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 3) { // HH:MM:SS
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else {
    const singleNumber = Number(time);
    if (!isNaN(singleNumber)) {
      return singleNumber;
    }
    return NaN;
  }
  return seconds;
};

const FlashcardCreator: React.FC<Props> = ({ addFlashcard }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [koreanPhrase, setKoreanPhrase] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false); // Renamed from showReferenceKeyboard

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTranslating(true);

    const videoId = getYoutubeVideoId(youtubeUrl);
    if (!videoId) {
        alert('Invalid YouTube URL');
        setIsTranslating(false);
        return;
    }

    const startTimeInSeconds = parseTimeToSeconds(startTime);
    const endTimeInSeconds = parseTimeToSeconds(endTime);

    if (isNaN(startTimeInSeconds) || isNaN(endTimeInSeconds)) {
        alert('Invalid time format. Please use HH:MM:SS, MM:SS, or seconds.');
        setIsTranslating(false);
        return;
    }

    if (!youtubeUrl || !koreanPhrase) {
      alert('Please fill in all fields');
      setIsTranslating(false);
      return;
    }

    const translatedText = await translateText(koreanPhrase);

    const newCard = {
      koreanPhrase,
      englishTranslation: translatedText,
      youtubeUrl,
      startTime: startTimeInSeconds,
      endTime: endTimeInSeconds,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    };

    addFlashcard(newCard);
    // Clear form
    setYoutubeUrl('');
    setStartTime('');
    setEndTime('');
    setKoreanPhrase('');
    setIsTranslating(false);
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Create a New Flashcard</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>YouTube URL</Form.Label>
            <Form.Control type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Start Time</Form.Label>
                <Form.Control type="text" placeholder="MM:SS" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>End Time</Form.Label>
                <Form.Control type="text" placeholder="MM:SS" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label className="d-flex justify-content-between align-items-center">
                Korean Phrase
                <Button variant="outline-secondary" size="sm" onClick={() => setShowKeyboard(!showKeyboard)}>
                    <KeyboardIcon /> {showKeyboard ? 'Hide' : 'Show'} Keyboard
                </Button>
            </Form.Label>
            <Form.Control as="textarea" rows={2} value={koreanPhrase} onChange={e => setKoreanPhrase(e.target.value)} />
          </Form.Group>
          {showKeyboard && (
            <div className="mt-3">
              <CustomJamoKeyboard input={koreanPhrase} onChange={setKoreanPhrase} />
            </div>
          )}
          <div className="d-grid mt-3">
            <Button variant="primary" type="submit" disabled={isTranslating}>
                {isTranslating ? 'Creating...' : 'Create Card'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FlashcardCreator;
