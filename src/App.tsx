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

const FLASHCARDS_KEY = 'flashcards';
const FLASHCARDS_BACKUP_KEY = 'flashcards_backup';

const parseDateSafely = (value: unknown, fallback: Date | null): Date | null => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date;
};

const normalizeFlashcard = (raw: unknown): Flashcard | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const card = raw as Partial<Flashcard> & Record<string, unknown>;
  const readNonEmptyString = (key: string): string | null => {
    const value = card[key];
    if (typeof value !== 'string' || value.trim() === '') {
      return null;
    }
    return value;
  };

  const id = readNonEmptyString('id');
  const koreanPhrase = readNonEmptyString('koreanPhrase');
  const englishTranslation = readNonEmptyString('englishTranslation');
  const youtubeUrl = readNonEmptyString('youtubeUrl');
  const thumbnailUrl = readNonEmptyString('thumbnailUrl');
  if (!id || !koreanPhrase || !englishTranslation || !youtubeUrl || !thumbnailUrl) {
    return null;
  }

  const startTime = Number(card.startTime);
  const endTime = Number(card.endTime);
  const interval = Number(card.interval ?? 1);
  const easeFactor = Number(card.easeFactor ?? 2.5);
  if ([startTime, endTime, interval, easeFactor].some(Number.isNaN)) {
    return null;
  }

  const nextReview = parseDateSafely(card.nextReview, new Date());
  if (!nextReview) {
    return null;
  }

  const status = card.status;
  const safeStatus = status === 'new' || status === 'learning' || status === 'mastered' ? status : 'new';

  return {
    id,
    koreanPhrase,
    englishTranslation,
    youtubeUrl,
    startTime,
    endTime,
    thumbnailUrl,
    lastReviewed: parseDateSafely(card.lastReviewed, null),
    nextReview,
    interval,
    easeFactor,
    status: safeStatus,
  };
};

const loadFlashcardsFromStorage = (key: string): Flashcard[] | null => {
  const storedValue = localStorage.getItem(key);
  if (!storedValue) {
    return null;
  }

  const parsedValue = JSON.parse(storedValue);
  if (!Array.isArray(parsedValue)) {
    throw new Error(`Stored value for ${key} is not an array`);
  }

  const normalizedCards = parsedValue.map(normalizeFlashcard).filter((card): card is Flashcard => Boolean(card));
  if (parsedValue.length > 0 && normalizedCards.length === 0) {
    throw new Error(`Stored value for ${key} has no valid flashcards`);
  }

  return normalizedCards;
};

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [reviewSessionMode, setReviewSessionMode] = useState<ReviewSessionMode>('none');

  useEffect(() => {
    try {
      const primaryCards = loadFlashcardsFromStorage(FLASHCARDS_KEY);
      if (primaryCards) {
        setFlashcards(primaryCards);
        localStorage.setItem(FLASHCARDS_BACKUP_KEY, JSON.stringify(primaryCards));
        return;
      }

      const backupCards = loadFlashcardsFromStorage(FLASHCARDS_BACKUP_KEY);
      if (backupCards) {
        setFlashcards(backupCards);
        localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(backupCards));
      }
    } catch (error) {
      console.error('Failed to load flashcards from localStorage', error);

      try {
        const backupCards = loadFlashcardsFromStorage(FLASHCARDS_BACKUP_KEY);
        if (backupCards) {
          setFlashcards(backupCards);
          localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(backupCards));
        }
      } catch (backupError) {
        console.error('Failed to restore flashcards backup', backupError);
      }
    }
  }, []);

  useEffect(() => {
    // Do not save the initial empty array to localStorage on first render
    if (flashcards.length > 0) {
        const serialized = JSON.stringify(flashcards);
        localStorage.setItem(FLASHCARDS_KEY, serialized);
        localStorage.setItem(FLASHCARDS_BACKUP_KEY, serialized);
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
          localStorage.removeItem(FLASHCARDS_KEY);
          localStorage.removeItem(FLASHCARDS_BACKUP_KEY);
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