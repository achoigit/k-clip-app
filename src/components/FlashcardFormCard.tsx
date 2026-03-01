import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Keyboard as KeyboardIcon } from 'react-bootstrap-icons';
import { getYoutubeVideoId } from '../utils/youtube';
import CustomJamoKeyboard from './CustomJamoKeyboard';

export interface FlashcardFormInitialValues {
  youtubeUrl: string;
  startTime: string;
  endTime: string;
  koreanPhrase: string;
  englishTranslation: string;
}

export interface FlashcardFormSubmitValues {
  koreanPhrase: string;
  englishTranslation: string;
  youtubeUrl: string;
  startTimeInSeconds: number;
  endTimeInSeconds: number;
  thumbnailUrl: string;
}

interface Props {
  title: string;
  submitLabel: string;
  submittingLabel: string;
  initialValues: FlashcardFormInitialValues;
  onSubmit: (values: FlashcardFormSubmitValues) => Promise<void> | void;
  onCancel?: () => void;
  resetOnSubmit?: boolean;
  showTranslationField?: boolean;
}

const parseTimeToSeconds = (time: string): number => {
  const parts = time.split(':').map(Number);
  if (parts.some(isNaN)) return NaN;

  let seconds = 0;
  if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
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

const FlashcardFormCard: React.FC<Props> = ({
  title,
  submitLabel,
  submittingLabel,
  initialValues,
  onSubmit,
  onCancel,
  resetOnSubmit = false,
  showTranslationField = false,
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState(initialValues.youtubeUrl);
  const [startTime, setStartTime] = useState(initialValues.startTime);
  const [endTime, setEndTime] = useState(initialValues.endTime);
  const [koreanPhrase, setKoreanPhrase] = useState(initialValues.koreanPhrase);
  const [englishTranslation, setEnglishTranslation] = useState(initialValues.englishTranslation);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setYoutubeUrl(initialValues.youtubeUrl);
    setStartTime(initialValues.startTime);
    setEndTime(initialValues.endTime);
    setKoreanPhrase(initialValues.koreanPhrase);
    setEnglishTranslation(initialValues.englishTranslation);
  }, [initialValues]);

  const clearForm = () => {
    setYoutubeUrl('');
    setStartTime('');
    setEndTime('');
    setKoreanPhrase('');
    setEnglishTranslation('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPhrase = koreanPhrase.trim();
    if (!trimmedPhrase) {
      alert('Korean phrase cannot be empty.');
      return;
    }

    const trimmedTranslation = englishTranslation.trim();
    if (showTranslationField && !trimmedTranslation) {
      alert('English translation cannot be empty.');
      return;
    }

    const videoId = getYoutubeVideoId(youtubeUrl);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    const startTimeInSeconds = parseTimeToSeconds(startTime);
    const endTimeInSeconds = parseTimeToSeconds(endTime);

    if (isNaN(startTimeInSeconds) || isNaN(endTimeInSeconds)) {
      alert('Invalid time format. Please use HH:MM:SS, MM:SS, or seconds.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        koreanPhrase: trimmedPhrase,
        englishTranslation: trimmedTranslation,
        youtubeUrl,
        startTimeInSeconds,
        endTimeInSeconds,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      });

      if (resetOnSubmit) {
        clearForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
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
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowKeyboard(!showKeyboard)}
              >
                <KeyboardIcon /> {showKeyboard ? 'Hide' : 'Show'} Keyboard
              </Button>
            </Form.Label>
            <Form.Control as="textarea" rows={2} value={koreanPhrase} onChange={e => setKoreanPhrase(e.target.value)} />
          </Form.Group>
          {showTranslationField && (
            <Form.Group className="mb-3">
              <Form.Label>English Translation</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={englishTranslation}
                onChange={e => setEnglishTranslation(e.target.value)}
              />
            </Form.Group>
          )}
          {showKeyboard && (
            <div className="mt-3">
              <CustomJamoKeyboard input={koreanPhrase} onChange={setKoreanPhrase} />
            </div>
          )}
          <div className="d-grid gap-2 mt-3">
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
            {onCancel && (
              <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FlashcardFormCard;
