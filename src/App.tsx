import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';
import Dashboard from './components/Dashboard';
import FlashcardCreator from './components/FlashcardCreator';
import FlashcardLibrary from './components/FlashcardLibrary';
import ReviewPage from './components/ReviewPage';
import { Flashcard } from './types';
import { updateFlashcardReview } from './services/srs';
import { useTheme } from './contexts/ThemeContext';

type ReviewSessionMode = 'none' | 'due' | 'difficult';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [reviewSessionMode, setReviewSessionMode] = useState<ReviewSessionMode>('none');

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

  const handleReview = (card: Flashcard, performance: 'easy' | 'okay' | 'hard') => {
    const updatedCard = updateFlashcardReview(card, performance);
    setFlashcards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const updateFlashcard = (updatedCard: Flashcard) => {
    setFlashcards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const startEditingFlashcard = (card: Flashcard) => {
    setEditingCard(card);
  };

  const stopEditingFlashcard = () => {
    setEditingCard(null);
  };

  const startReviewSession = (mode: Exclude<ReviewSessionMode, 'none'>) => {
    setReviewSessionMode(mode);
    setEditingCard(null);
  };

  const stopReviewSession = () => {
    setReviewSessionMode('none');
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
    <div className="app-shell">
      <Container fluid className="app-container py-4">
        <header className="app-header mb-4">
          <div>
            <p className="app-eyebrow mb-1">K-Clip</p>
            <h1 className="app-title mb-0">Korean Phrase Learning Studio</h1>
          </div>
          <div className="theme-controls">
            <span className="theme-state-pill" aria-live="polite">
              Current: {theme === 'light' ? 'Light' : 'Dark'}
            </span>
            <Button
              variant="outline-primary"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? <MoonStarsFill /> : <SunFill />}
              <span className="ms-2">{theme === 'light' ? 'Dark' : 'Light'} mode</span>
            </Button>
          </div>
        </header>
        <Tabs defaultActiveKey="library" id="main-tabs" className="main-tabs mb-3">
            <Tab eventKey="library" title="Library">
            <Row>
                <Col md={4} className="mb-4 mb-md-0">
                <Dashboard
                  flashcards={flashcards}
                  reviewSessionMode={reviewSessionMode}
                  onStartDueReview={() => startReviewSession('due')}
                  onStartDifficultReview={() => startReviewSession('difficult')}
                  onBackToLibrary={stopReviewSession}
                />
                <FlashcardCreator
                  addFlashcard={addFlashcard}
                  editingCard={editingCard}
                  onUpdateFlashcard={updateFlashcard}
                  onCancelEdit={stopEditingFlashcard}
                />
                </Col>
                <Col md={8}>
                {reviewSessionMode === 'none' ? (
                  <FlashcardLibrary
                    flashcards={flashcards}
                    onUpdateFlashcard={updateFlashcard}
                    onDeleteFlashcard={deleteFlashcard}
                    onEditFlashcard={startEditingFlashcard}
                  />
                ) : (
                  <ReviewPage
                    flashcards={flashcards}
                    onReview={handleReview}
                    mode={reviewSessionMode}
                    onExit={stopReviewSession}
                  />
                )}
                </Col>
            </Row>
            </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default App;