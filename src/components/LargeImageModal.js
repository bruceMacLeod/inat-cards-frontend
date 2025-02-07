import React from 'react';

const LargeImageModal = ({ isOpen, onClose, currentCard }) => {
    if (!isOpen || !currentCard || !currentCard.image_url) return null;

    // Create the full-size image URL by removing '_square' from the URL
    const largeImageUrl = currentCard.image_url.replace('_square', '');

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
                backgroundColor: 'rgba(0,0,0,0.9)', // Even darker overlay for better contrast
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '10px' // Reduced padding to maximize space
            }}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    padding: '10px', // Reduced padding
                    borderRadius: '8px',
                    width: '99%', // Increased width
                    height: '99%', // Increased height
                    maxWidth: '2000px', // Increased maximum width
                    maxHeight: '99vh', // Increased maximum height
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                }}
            >
                {/* Image container */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    margin: '0',
                    position: 'relative'
                }}>
                    <img
                        src={largeImageUrl}
                        alt="Large species"
                        style={{
                            maxWidth: '99%',
                            maxHeight: 'calc(99vh - 80px)', // Increased size, minimal space for attribution
                            objectFit: 'contain',
                            borderRadius: '4px'
                        }}
                    />
                </div>

                {/* Attribution overlay at the bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '8px',
                    fontSize: '12px',
                    color: '#666',
                    textAlign: 'center',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px'
                }}>
                    {attribution}
                    <a
                        href={currentCard.observation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        View on iNaturalist
                    </a>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        padding: '6px 12px',
                        backgroundColor: 'rgba(0, 123, 255, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        zIndex: 1001
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'rgba(0, 86, 179, 0.9)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.8)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default LargeImageModal;