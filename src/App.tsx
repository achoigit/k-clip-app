import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import Dashboard from './components/Dashboard';
import FlashcardCreator from './components/FlashcardCreator';
import FlashcardLibrary from './components/FlashcardLibrary';
import ReviewPage from './components/ReviewPage';
import { Flashcard } from './types';
import { updateFlashcardReview } from './services/srs';

const App: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  useEffect(() => {
    try {
      const storedFlashcards = localStorage.getItem('flashcards');
      if (storedFlashcards) {
        const parsedFlashcards = JSON.parse(storedFlashcards).map((card: any) => ({
          ...card,
          nextReview: new Date(card.nextReview),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : null,
        }));
        setFlashcards(parsedFlashcards);
      }
    } catch (error) {
      console.error("Failed to load or parse flashcards from localStorage", error);
      // Optionally, clear the corrupted storage
      // localStorage.removeItem('flashcards');
    }
  }, []);

  useEffect(() => {
    // Do not save the initial empty array to localStorage on first render
    if (flashcards.length > 0) {
        localStorage.setItem('flashcards', JSON.stringify(flashcards));
    }
  }, [flashcards]);

  const addFlashcard = (card: Omit<Flashcard, 'id' | 'lastReviewed' | 'nextReview' | 'interval' | 'easeFactor' | 'status'>) => {
    const newCard: Flashcard = {
      ...card,
      id: new Date().toISOString(),
      lastReviewed: null,
      nextReview: new Date(),
      interval: 1,
      easeFactor: 2.5,
      status: 'new',
    };
    setFlashcards(prev => [...prev, newCard]);
  };

  const handleReview = (card: Flashcard, performance: 'easy' | 'good' | 'hard') => {
    const updatedCard = updateFlashcardReview(card, performance);
    setFlashcards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const updateFlashcard = (updatedCard: Flashcard) => {
    setFlashcards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const deleteFlashcard = (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
        const newFlashcards = flashcards.filter(c => c.id !== cardId);
        setFlashcards(newFlashcards);
        // If the last card is deleted, clear localStorage
        if (newFlashcards.length === 0) {
            localStorage.removeItem('flashcards');
        }
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Container fluid className="py-4">
        <Row>
            <Col>
            <h1 className="text-center mb-4">K-Clip: Korean Language Learning</h1>
            </Col>
        </Row>
        <Tabs defaultActiveKey="library" id="main-tabs" className="mb-3">
            <Tab eventKey="library" title="Library">
            <Row>
                <Col md={4}>
                <Dashboard flashcards={flashcards} />
                <FlashcardCreator addFlashcard={addFlashcard} />
                </Col>
                <Col md={8}>
                <FlashcardLibrary flashcards={flashcards} onUpdateFlashcard={updateFlashcard} onDeleteFlashcard={deleteFlashcard} />
                </Col>
            </Row>
            </Tab>
            <Tab eventKey="review" title="Review">
            <ReviewPage flashcards={flashcards} onReview={handleReview} />
            </Tab>
        </Tabs>
        </Container>
    </div>
  );
};

export default App;