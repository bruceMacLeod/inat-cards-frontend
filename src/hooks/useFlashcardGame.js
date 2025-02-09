// src/hooks/useFlashcardGame.js
import { useState, useCallback } from 'react';
// import useHints from './useHints';

export const useFlashcardGame = (currentCard) => {
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [pronounceEnabled, setPronounceEnabled] = useState(false);
//    const { toggleHints } = useHints(); // Call the hook and destructure


    const checkAnswer = useCallback((hint = null) => {
        if (!currentCard) {
            setFeedback('No card available.');
            return;
        }

        const userAnswer = hint !== null ? String(hint) : String(answer);
        console.log(userAnswer.toLowerCase(), currentCard.scientific_name.toLowerCase());
        const isCorrect = userAnswer.trim().trimEnd().toLowerCase() === currentCard.scientific_name.trim().trimEnd().toLowerCase();
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

    const resetGameState = useCallback(() => {
        setFeedback('');
        setAnswer('');
        setAttempts(0);
        setPronounceEnabled(false);

    }, []);

    return {
        answer,
        setAnswer,
        feedback,
        attempts,
        pronounceEnabled,
        checkAnswer,
        resetGameState
    };
};
export default useFlashcardGame;