import React from 'react';

const PronunciationModal = ({ pronunciationModalOpen, pronunciationText, setPronunciationModalOpen }) => {
    if (!pronunciationModalOpen) return null;

    const displayText = () => {
        try {
            const parsedJson = JSON.parse(pronunciationText);
            return JSON.stringify(parsedJson, null, 2);
        } catch (error) {
            return pronunciationText;
        }
    };

    return (
        <div style={{
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
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '10px',
                width: '400px',
                maxHeight: '300px',
                overflowY: 'auto'
            }}>
                <h2>Pronunciation</h2>
                <pre style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    fontFamily: 'monospace',
                    backgroundColor: '#f4f4f4',
                    padding: '10px',
                    borderRadius: '5px'
                }}>
                    {displayText()}
                </pre>
                <button
                    onClick={() => setPronunciationModalOpen(false)}
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

export default PronunciationModal;