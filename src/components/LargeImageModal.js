import React from 'react';

const LargeImageModal = ({ isOpen, onClose, currentCard }) => {
    if (!isOpen || !currentCard || !currentCard.image_url) return null;

    // Construct the attribution text
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
                    maxWidth: '95%', // Increase modal width
                    maxHeight: '95%', // Increase modal height
                    overflow: 'auto',
                    textAlign: 'center'
                }}
            >
                {/* Display the large image */}
                <img
                    src={currentCard.image_url} // Use the image_url from currentCard
                    alt="Large species"
                    style={{
                        maxWidth: '90vw', // Increase image width to 90% of viewport width
                        maxHeight: '90vh', // Increase image height to 90% of viewport height
                        marginBottom: '10px'
                    }}
                />

                {/* Attribution and link to iNaturalist */}
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

                {/* Close button */}
                <button
                    onClick={onClose}
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

export default LargeImageModal;