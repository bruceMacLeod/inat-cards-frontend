// src/App.js
import React, {useEffect, useCallback, useState} from 'react';
import axios from 'axios';
import {useFlashcardDeck} from './hooks/useFlashcardDeck';
import {useFlashcardGame} from './hooks/useFlashcardGame';
import {useHints} from './hooks/useHints';
import {FlashcardDisplay} from './components/FlashcardDisplay';
import FileManagementModal from './components/FileManagementModal';
import PronunciationModal from './components/PronunciationModal';
import LargeImageModal from './components/LargeImageModal';
import static_cards from './data/uploads/macleod-obs-taxa';

const App = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isLargeImageModalOpen, setIsLargeImageModalOpen] = useState(false);
    const [pronunciationModalOpen, setPronunciationModalOpen] = useState(false);
    const [pronunciationText, setPronunciationText] = useState('');
    const [isServerWakingUp, setIsServerWakingUp] = useState(false);

    console.log('API URL:', apiUrl);
    const {
        currentCard,
        currentFileName,
        loadCardsFromFile,
        nextCard,
        restartDeck,
        setCards,
        shuffleCards
    } = useFlashcardDeck(apiUrl);

    const {
        answer,
        setAnswer,
        feedback,
        pronounceEnabled,
        checkAnswer,
        resetGameState
    } = useFlashcardGame(currentCard);

    const {
        hints,
        hintsVisible,
        setHintsVisible,
        updateHints,
        toggleHints
    } = useHints();

    useEffect(() => {
        const wakeUpServer = async () => {
            try {
                await axios.get(`${apiUrl}/wakeup`);
                console.log('Server is awake!');
            } catch (error) {
                console.error('Error waking up server:', error);
            }
        };
        wakeUpServer();
    }, [apiUrl]);

    useEffect(() => {
        const shuffledCards = shuffleCards([...static_cards]);
        setCards(shuffledCards);
        updateHints(shuffledCards);
    }, [shuffleCards, setCards, updateHints]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    }, [checkAnswer]);

    const handleFileSelect = useCallback(async (filename, directory) => {
        const newCards = await loadCardsFromFile(filename, directory);
        updateHints(newCards);
        resetGameState();
        setIsFileModalOpen(false);
    }, [loadCardsFromFile, updateHints, resetGameState]);

    const openPronunciationModal = useCallback(async () => {
        if (!currentCard) return;

        try {
            const wakeupResponse = await axios.get(`${apiUrl}/wakeup`);
            if (wakeupResponse.status !== 200) {
                setIsServerWakingUp(true);
                setPronunciationModalOpen(true);
                return;
            }

            const response = await axios.post(`${apiUrl}/pronounce_name`, {
                scientific_name: currentCard.scientific_name
            });
            setPronunciationText(response.data.pronunciation);
            setIsServerWakingUp(false);
            setPronunciationModalOpen(true);
        } catch (err) {
            console.error(err);
            setIsServerWakingUp(true);
            setPronunciationModalOpen(true);
        }
    }, [apiUrl, currentCard]);

    const selectHint = useCallback((hint) => {
        setAnswer(hint);
        checkAnswer(hint);
    }, [setAnswer, checkAnswer]);

    if (!currentCard) {
        return <p>No cards available. Please load a file.</p>;
    }

    return (
        <div className="app-container">
            {/* Updated file-management div with new styling */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                textAlign: 'right',
                zIndex: 1000
            }}>
                <button onClick={() => setIsFileModalOpen(true)}>
                    Manage Files
                </button>
                <div style={{marginTop: '10px'}}>
                    <span>{currentFileName}</span>
                </div>
            </div>

            <FileManagementModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                onFileSelect={handleFileSelect}
            />

            <PronunciationModal
                pronunciationModalOpen={pronunciationModalOpen}
                pronunciationText={pronunciationText}
                setPronunciationModalOpen={setPronunciationModalOpen}
                isServerWakingUp={isServerWakingUp}
            />

            <LargeImageModal
                isOpen={isLargeImageModalOpen}
                onClose={() => setIsLargeImageModalOpen(false)}
                currentCard={currentCard}
            />

            <FlashcardDisplay
                currentCard={currentCard}
                answer={answer}
                setAnswer={setAnswer}
                handleKeyDown={handleKeyDown}
                checkAnswer={checkAnswer}
                toggleHints={toggleHints}
                hintsVisible={hintsVisible}
                feedback={feedback}
                pronounceEnabled={pronounceEnabled}
                openPronunciationModal={openPronunciationModal}
                nextCard={() => {
                    nextCard();
                    resetGameState();
                    setHintsVisible(false);
                }}
                restartDeck={() => {
                    restartDeck(); // Restart the deck
                    resetGameState(); // Reset game state (including hints visibility)
                    setHintsVisible(false);
                }}
                openLargeImageModal={() => setIsLargeImageModalOpen(true)}
                hints={hints}
                selectHint={selectHint}
            />
        </div>
    );
};

export default App;