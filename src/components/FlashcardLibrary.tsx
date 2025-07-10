
import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Flashcard } from '../types';
import VideoPlayer from './VideoPlayer';
import EditFlashcardModal from './EditFlashcardModal';
import { getYoutubeVideoId } from '../utils/youtube';
import { translateText } from '../services/translation';
import { Play, Translate, Mic, Pencil, Trash, ArrowClockwise } from 'react-bootstrap-icons';

interface Props {
  flashcards: Flashcard[];
  onUpdateFlashcard: (updatedCard: Flashcard) => void;
  onDeleteFlashcard: (cardId: string) => void;
}

const FlashcardLibrary: React.FC<Props> = ({ flashcards, onUpdateFlashcard, onDeleteFlashcard }) => {
  const [selectedVideo, setSelectedVideo] = useState<Flashcard | null>(null);
  const [showTranslation, setShowTranslation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [isTranslating, setIsTranslating] = useState<string | null>(null);

  const playVideo = (card: Flashcard) => {
    setSelectedVideo(card);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const toggleTranslation = (cardId: string) => {
    if (showTranslation === cardId) {
      setShowTranslation(null);
    } else {
      setShowTranslation(cardId);
    }
  };

  const speakKorean = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card);
  };

  const handleCloseEdit = () => {
    setEditingCard(null);
  };

  const handleFixTranslation = async (card: Flashcard) => {
    setIsTranslating(card.id);
    const translatedText = await translateText(card.koreanPhrase);
    const updatedCard = { ...card, englishTranslation: translatedText };
    onUpdateFlashcard(updatedCard);
    setIsTranslating(null);
  };

  const filteredFlashcards = flashcards.filter(card =>
    card.koreanPhrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.englishTranslation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTooltip = (text: string) => (
    <Tooltip>{text}</Tooltip>
  );

  return (
    <div>
      <h2>Flashcard Library</h2>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by Korean or English phrase..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </Form.Group>
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredFlashcards.map(card => (
          <Col key={card.id}>
            <Card>
              <div className="position-relative">
                <Card.Img variant="top" src={card.thumbnailUrl} />
                <div className="position-absolute top-50 start-50 translate-middle">
                    <Button variant="light" onClick={() => playVideo(card)}><Play size={32} /></Button>
                </div>
              </div>
              <Card.Body>
                <Card.Text className="fw-bold">{card.koreanPhrase}</Card.Text>
                {showTranslation === card.id && (
                  <Card.Text className="text-muted fst-italic">{card.englishTranslation}</Card.Text>
                )}
                <div className="d-flex justify-content-end">
                    <OverlayTrigger placement="top" overlay={renderTooltip('Translate')}>
                        <Button variant="secondary" size="sm" onClick={() => toggleTranslation(card.id)}><Translate /></Button>
                    </OverlayTrigger>
                    {card.englishTranslation === '[Auto-translated]' && (
                        <OverlayTrigger placement="top" overlay={renderTooltip('Fix Translation')}>
                            <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="ms-2"
                                disabled={isTranslating === card.id}
                                onClick={() => handleFixTranslation(card)}>
                                <ArrowClockwise />
                            </Button>
                        </OverlayTrigger>
                    )}
                    <OverlayTrigger placement="top" overlay={renderTooltip('Speak')}>
                        <Button variant="info" size="sm" className="ms-2" onClick={() => speakKorean(card.koreanPhrase)}><Mic /></Button>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={renderTooltip('Edit')}>
                        <Button variant="outline-primary" size="sm" className="ms-2" onClick={() => handleEdit(card)}><Pencil /></Button>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={renderTooltip('Delete')}>
                        <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => onDeleteFlashcard(card.id)}><Trash /></Button>
                    </OverlayTrigger>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {selectedVideo && (
        <VideoPlayer
          show={true}
          onHide={closeVideo}
          videoId={getYoutubeVideoId(selectedVideo.youtubeUrl) || ''}
          startTime={selectedVideo.startTime}
          endTime={selectedVideo.endTime}
        />
      )}
      {editingCard && (
        <EditFlashcardModal
          show={true}
          onHide={handleCloseEdit}
          card={editingCard}
          onSave={onUpdateFlashcard}
        />
      )}
    </div>
  );
};

export default FlashcardLibrary;
