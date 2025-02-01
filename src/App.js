import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import FileManagementModal from './file-management-modal';
import PronunciationModal from './PronunciationModal';
import _ from 'lodash';

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

    const apiUrl = process.env.REACT_APP_API_URL;

    const currentCard = cards[currentCardIndex];

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

    useEffect(() => {
        const loadDefaultFile = async () => {
            try {
                await loadcardsfromfile('macleod-obs-taxa.csv', 'uploads');
            } catch (error) {
                console.error('Error loading default file:', error);
            }
        };

        if (_.isEmpty(cards)) {
            loadDefaultFile().then();
        }
    }, [cards, loadcardsfromfile]);

    const checkAnswer = useCallback(() => {
        if (!currentCard) return;

        const isCorrect = answer.toLowerCase() === currentCard.scientific_name.toLowerCase();
        if (isCorrect) {
            setFeedback(`Correct! (${currentCard.common_name})`);
            setPronounceEnabled(true);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 3) {
                setFeedback(`Incorrect. The correct name is: ${currentCard.scientific_name}`);
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
        const cardLength = cards.length;
        const nextIndex = (currentCardIndex + 1) % cardLength;
        setCurrentCardIndex(nextIndex);
        resetState();
    }, [cards.length, currentCardIndex, resetState]);

    const restartDeck = useCallback(() => {
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
        if (!currentCard) return;

        try {
            const response = await axios.post(`${apiUrl}/pronounce_name`, {
                scientific_name: currentCard.scientific_name
            });
            setPronunciationText(response.data.pronunciation);
            setPronunciationModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    }, [apiUrl, currentCard]);

    const openLargeImageModal = useCallback(() => {
        if (!currentCard) return;
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
    }, []);

    const LargeImageModal = () => {
        if (!isLargeImageModalOpen) return null;

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
                        overflow: 'auto'
                    }}
                >
                    <img
                        src={largeImageUrl}
                        alt="Large species"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%'
                        }}
                    />
                    <button
                        onClick={closeLargeImageModal}
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px'
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
            />

            <LargeImageModal />

            <FileManagementModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                onFileSelect={handleFileSelect}
            />

            {currentCard && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <h1>Species Flashcard</h1>

                    <div onClick={openLargeImageModal} style={{ cursor: 'pointer' }}>
                        <img
                            src={`${apiUrl}/get_image?url=${encodeURIComponent(currentCard.image_url)}`}
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
                        >
                            {feedback}
                        </div>
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
            )}
        </div>
    );
};

export default App;