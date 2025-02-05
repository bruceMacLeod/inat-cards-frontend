import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import FileManagementModal from './file-management-modal';
import PronunciationModal from './PronunciationModal';
import static_cards from './data/uploads/macleod-obs-taxa';
// import WakeupPoller from './WakeUpPoller';

const App = () => {
    const [cards, setCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [hintsVisible, setHintsVisible] = useState(false);
    const [hints, setHints] = useState([]);
    const [attempts, setAttempts] = useState(0);
    const [pronounceEnabled, setPronounceEnabled] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [pronunciationModalOpen, setPronunciationModalOpen] = useState(false);
    const [pronunciationText, setPronunciationText] = useState('');
    const [isLargeImageModalOpen, setIsLargeImageModalOpen] = useState(false);
    const [largeImageUrl, setLargeImageUrl] = useState('');
    const [currentFileName, setCurrentFileName] = useState('macleod-obs-taxa');
    const [isServerWakingUp, setIsServerWakingUp] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log(`API URL: ${apiUrl}`);

    // Asynchronously wake up the Flask server
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

    const resetState = useCallback(() => {
        setFeedback('');
        setAnswer('');
        setAttempts(0);
        setPronounceEnabled(false);
        setHintsVisible(false);
    }, []);

    const shuffleCards = useCallback((array) => {
        const newArray = [...array];
        let currentIndex = newArray.length;
        let temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = newArray[currentIndex];
            newArray[currentIndex] = newArray[randomIndex];
            newArray[randomIndex] = temporaryValue;
        }

        return newArray;
    }, []);

    const updateHints = useCallback((cardArray) => {
        const uniqueNames = [...new Set(cardArray.map(card => card.scientific_name))];
        setHints(uniqueNames.sort());
    }, []);

    const loadcardsfromfile = useCallback(async (filename, directory = 'mmaforays') => {
        try {
            const response = await axios.post(`${apiUrl}/load_cards`, {
                filename,
                directory
            });

            const shuffledCards = shuffleCards([...response.data]);
            setCards(shuffledCards);
            setCurrentCardIndex(0);
            resetState();
            updateHints(shuffledCards);
            setCurrentFileName(filename.replace('.csv', ''));
        } catch (error) {
            console.error('Error loading cards:', error);
        }
    }, [apiUrl, shuffleCards, resetState, updateHints]);

    // Load static data on initial render
    useEffect(() => {
        const shuffledCards = shuffleCards([...static_cards]);
        setCards(shuffledCards);
        updateHints(shuffledCards);
        setCurrentFileName('macleod-obs-taxa');
        setCurrentCardIndex(0);
        resetState();
    }, [resetState, shuffleCards, updateHints]);

    const currentCard = cards[currentCardIndex]; // Define currentCard here

    const checkAnswer = useCallback((hint = null) => {
        if (!currentCard) {
            setFeedback('No card available.');
            return;
        }

        const userAnswer = hint !== null ? String(hint) : String(answer);
        const isCorrect = userAnswer.toLowerCase() === currentCard.scientific_name.toLowerCase();
        const taxaUrl = currentCard.taxa_url;
        const hyperlinkedName = `<a href="${taxaUrl}" target="_blank" rel="noopener noreferrer">${currentCard.scientific_name}</a>`;
        const hyperlinkedCommonName = currentCard.common_name
            ? `<a href="${taxaUrl}" target="_blank" rel="noopener noreferrer">${currentCard.common_name}</a>`
            : '';

        if (isCorrect) {
            setFeedback(`Correct! ${hyperlinkedName} (${hyperlinkedCommonName})`);
            setPronounceEnabled(true);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 3) {
                setFeedback(`Incorrect. The correct name is: ${hyperlinkedName} (${hyperlinkedCommonName})`);
                setPronounceEnabled(true);
            } else {
                setFeedback('Incorrect. Try again!');
            }
        }
    }, [answer, attempts, currentCard]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    }, [checkAnswer]);

    const nextCard = useCallback(() => {
        if (cards.length === 0) return; // Prevent action if no cards are available
        const nextIndex = (currentCardIndex + 1) % cards.length;
        setCurrentCardIndex(nextIndex);
        resetState();
    }, [cards.length, currentCardIndex, resetState]);

    const restartDeck = useCallback(() => {
        if (cards.length === 0) return; // Prevent action if no cards are available
        const shuffledCards = shuffleCards([...cards]);
        setCards(shuffledCards);
        setCurrentCardIndex(0);
        resetState();
    }, [cards, shuffleCards, resetState]);

    const handleFileSelect = useCallback(async (filename, directory = 'mmaforays') => {
        await loadcardsfromfile(filename, directory);
        setIsFileModalOpen(false);
    }, [loadcardsfromfile]);

    const openPronunciationModal = useCallback(async () => {
    if (!currentCard) {
        alert('No card available.');
        return;
    }

    try {
        // Check if the server is awake
        const wakeupResponse = await axios.get(`${apiUrl}/wakeup`);
        if (wakeupResponse.status !== 200) {
            setIsServerWakingUp(true); // Set wake-up state if the server is not ready
            setPronunciationModalOpen(true); // Open the modal to show the wake-up message
            return;
        }

        // If the server is awake, fetch the pronunciation
        const response = await axios.post(`${apiUrl}/pronounce_name`, {
            scientific_name: currentCard.scientific_name
        });
        setPronunciationText(response.data.pronunciation);
        setIsServerWakingUp(false); // Reset wake-up state
        setPronunciationModalOpen(true);
    } catch (err) {
        console.error(err);
        setIsServerWakingUp(true); // Set wake-up state if there's an error
        setPronunciationModalOpen(true); // Open the modal to show the wake-up message
    }
}, [apiUrl, currentCard]);

    const openLargeImageModal = useCallback(() => {
        if (!currentCard) {
            alert('No card available.');
            return;
        }
        const largeUrl = currentCard.image_url.replace('medium', 'large');
        setLargeImageUrl(largeUrl);
        setIsLargeImageModalOpen(true);
    }, [currentCard]);

    const closeLargeImageModal = useCallback(() => {
        setIsLargeImageModalOpen(false);
        setLargeImageUrl('');
    }, []);

    const toggleHints = useCallback(() => {
        setHintsVisible(prev => !prev);
    }, []);

    const selectHint = useCallback((hint) => {
        setAnswer(hint);
        checkAnswer(hint);
    }, [checkAnswer]);

    const LargeImageModal = () => {
        if (!isLargeImageModalOpen || !currentCard) return null;

        const attribution = `${currentCard.observer_name}, ${currentCard.observation_year}. iNaturalist observation: `;

        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}
            >
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        maxWidth: '90%',
                        maxHeight: '90%',
                        overflow: 'auto',
                        textAlign: 'center'
                    }}
                >
                    <img
                        src={largeImageUrl}
                        alt="Large species"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '80vh',
                            marginBottom: '10px'
                        }}
                    />
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                        {attribution}
                        <a
                            href={currentCard.observation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#007bff', textDecoration: 'none' }}
                        >
                            View on iNaturalist
                        </a>
                    </div>
                    <button
                        onClick={closeLargeImageModal}
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            padding: '20px',
            fontFamily: 'Arial',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '5px'
            }}>
                {/*<WakeupPoller />  Add the WakeupPoller component here */}
                <button
                    onClick={() => setIsFileModalOpen(true)}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        backgroundColor: '#f8f8f8',
                        cursor: 'pointer'
                    }}
                >
                    Manage Files
                </button>
                {currentFileName}
            </div>

            <PronunciationModal
                pronunciationModalOpen={pronunciationModalOpen}
                pronunciationText={pronunciationText}
                setPronunciationModalOpen={setPronunciationModalOpen}
                isServerWakingUp={isServerWakingUp}
            />

            <LargeImageModal />

            <FileManagementModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                onFileSelect={handleFileSelect}
            />

            {currentCard ? (
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <h1>Species Flashcard</h1>

                    <div onClick={openLargeImageModal} style={{ cursor: 'pointer' }}>
                        <img
                            src={currentCard.image_url}
                            alt={currentCard.scientific_name}
                            style={{
                                maxWidth: '300px',
                                maxHeight: '300px',
                                marginBottom: '20px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter scientific name"
                            style={{
                                width: '100%',
                                padding: '10px',
                                marginBottom: '10px'
                            }}
                        />
                        <button
                            onClick={checkAnswer}
                            style={{
                                padding: '10px 20px',
                                marginRight: '10px'
                            }}
                        >
                            Check Answer
                        </button>
                        <button
                            onClick={toggleHints}
                            style={{ padding: '10px 20px' }}
                        >
                            {hintsVisible ? 'Hide Hints' : 'Show Hints'}
                        </button>
                    </div>

                    {feedback && (
                        <div
                            style={{
                                color: feedback.includes('Incorrect') ? 'red' : 'green',
                                marginBottom: '20px'
                            }}
                            dangerouslySetInnerHTML={{ __html: feedback }}
                        />
                    )}

                    {pronounceEnabled && (
                        <button
                            onClick={openPronunciationModal}
                            style={{ padding: '10px 20px' }}
                        >
                            Pronounce Name
                        </button>
                    )}

                    <button
                        onClick={nextCard}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px'
                        }}
                    >
                        Next Card
                    </button>

                    <button
                        onClick={restartDeck}
                        style={{
                            marginTop: '20px',
                            marginLeft: '10px',
                            padding: '10px 20px'
                        }}
                    >
                        Restart Deck
                    </button>

                    {hintsVisible && (
                        <div style={{
                            backgroundColor: '#f0f0f0',
                            padding: '10px',
                            marginTop: '20px'
                        }}>
                            <h3>Hints</h3>
                            {hints.map((hint) => (
                                <button
                                    key={hint}
                                    onClick={() => selectHint(hint)}
                                    style={{
                                        margin: '5px',
                                        padding: '5px 10px'
                                    }}
                                >
                                    {hint}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p>No cards available. Please load a file.</p>
            )}
        </div>
    );
};

export default App;