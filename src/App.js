import React, { useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import { useFlashcardDeck } from './hooks/useFlashcardDeck';
import { useFlashcardGame } from './hooks/useFlashcardGame';
import { useHints } from './hooks/useHints';
import { FlashcardDisplay } from './components/FlashcardDisplay';
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

//    console.log('API URL:', apiUrl);
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

    // Retry mechanism for waking up the server
    const wakeUpServer = useCallback(async () => {
        let retries = 5; // Number of retries
        let delay = 3000; // Delay between retries in milliseconds

        setIsServerWakingUp(true); // Show "Server is starting up" message

        while (retries > 0) {
            try {
                const wakeupResponse = await axios.get(`${apiUrl}/wakeup`);
                if (wakeupResponse.status === 200) {
                    console.log('Server is awake!');
                    setIsServerWakingUp(false); // Hide "Server is starting up" message
                    return;
                }
            } catch (error) {
                console.log('Error waking up server:', error);
            }

            retries--;
            if (retries > 0) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        // If all retries fail, show an error message
        console.error('Failed to wake up server after multiple retries.');
        setIsServerWakingUp(false); // Optionally, you can keep this true to show an error message
    }, [apiUrl]);

    useEffect(() => {
        wakeUpServer();
    }, [wakeUpServer]);

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
//            if (isServerWakingUp){
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
                <div style={{ marginTop: '10px' }}>
                    <span>{currentFileName}</span>
                </div>
            </div>

            {/* Display "Server is starting up" message
            {isServerWakingUp && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    zIndex: 1000
                }}>
                    <p>Server is starting up, please wait...</p>
                </div>
            )}
*/}
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