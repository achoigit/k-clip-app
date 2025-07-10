
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Flashcard } from '../types';
import { getYoutubeVideoId } from '../utils/youtube';

interface Props {
  show: boolean;
  onHide: () => void;
  card: Flashcard;
  onSave: (updatedCard: Flashcard) => void;
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

const EditFlashcardModal: React.FC<Props> = ({ show, onHide, card, onSave }) => {
  const [youtubeUrl, setYoutubeUrl] = useState(card.youtubeUrl);
  const [startTime, setStartTime] = useState(String(card.startTime));
  const [endTime, setEndTime] = useState(String(card.endTime));

  useEffect(() => {
    setYoutubeUrl(card.youtubeUrl);
    setStartTime(String(card.startTime));
    setEndTime(String(card.endTime));
  }, [card]);

  const handleSave = () => {
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

    const updatedCard = {
      ...card,
      youtubeUrl,
      startTime: startTimeInSeconds,
      endTime: endTimeInSeconds,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    };
    onSave(updatedCard);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Flashcard</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>YouTube URL</Form.Label>
            <Form.Control type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start Time (HH:MM:SS or MM:SS)</Form.Label>
            <Form.Control type="text" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Time (HH:MM:SS or MM:SS)</Form.Label>
            <Form.Control type="text" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditFlashcardModal;
