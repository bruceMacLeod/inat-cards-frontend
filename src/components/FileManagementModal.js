import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const FileManagementModal = ({ isOpen, onClose, onFileSelect }) => {
    const [serverFiles, setServerFiles] = useState([]);
    const [currentDirectory, setCurrentDirectory] = useState('mmaforays');
    const [isServerWakingUp, setIsServerWakingUp] = useState(false);
    const [serverStartupMessage, setServerStartupMessage] = useState('');
    const apiUrl = process.env.REACT_APP_API_URL;

    const fetchserverfiles = useCallback(async () => {
        setIsServerWakingUp(true);
        setServerStartupMessage('Checking server status...');

        try {
            // First try to wake up the server
            await axios.get(`${apiUrl}/wakeup`);

            try {
                // If server is awake, try to fetch files
                const response = await axios.get(`${apiUrl}/list_csv_files?directory=${currentDirectory}`);
                setServerFiles(response.data.files);
                setIsServerWakingUp(false);
                setServerStartupMessage('');
            } catch (filesErr) {
                console.error('Error fetching files:', filesErr);

                // Check if it's a CORS error (indicates server is still starting)
                if (filesErr.message.includes('CORS') || filesErr.message.includes('Network Error')) {
                    setServerStartupMessage('Server is starting up. Please wait a moment and try again...');
                } else {
                    setServerStartupMessage('Unable to fetch files. Please try again.');
                }
            }
        } catch (wakeupErr) {
            console.error('Server wake-up error:', wakeupErr);
            setServerStartupMessage('Server is currently offline. Please try again in a few minutes.');
        }
    }, [apiUrl, currentDirectory]);

    useEffect(() => {
        if (isOpen) {
            fetchserverfiles();
        }
    }, [isOpen, fetchserverfiles]);

    const handleDirectoryChange = useCallback((directory) => {
        setCurrentDirectory(directory);
    }, []);

    const handleFileUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsServerWakingUp(true);
        setServerStartupMessage('Uploading file...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('directory', 'uploads');

        try {
            await axios.post(`${apiUrl}/upload_csv`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchserverfiles();
            alert('File uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            if (error.message.includes('CORS') || error.message.includes('Network Error')) {
                setServerStartupMessage('Server is starting up. Please try again in a moment.');
            } else {
                alert('File upload failed');
                setIsServerWakingUp(false);
            }
        }
    }, [apiUrl, fetchserverfiles]);

    const handleFileSelect = useCallback(async (filename) => {
        try {
            await onFileSelect(filename, currentDirectory);
            onClose();
        } catch (error) {
            console.error('File selection error:', error);
            if (error.message.includes('CORS') || error.message.includes('Network Error')) {
                setServerStartupMessage('Server is starting up. Please try again in a moment.');
                setIsServerWakingUp(true);
            }
        }
    }, [currentDirectory, onFileSelect, onClose]);

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-management-title"
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
                    width: '500px',
                    maxHeight: '80%',
                    overflowY: 'auto'
                }}
            >
                <h2 id="file-management-title">File Management</h2>

                {/* Always show the server message if it exists */}
                {serverStartupMessage && (
                    <p style={{
                        color: '#ff0000',
                        textAlign: 'center',
                        padding: '10px',
                        margin: '10px 0',
                        backgroundColor: '#fff0f0',
                        borderRadius: '5px'
                    }}>
                        {serverStartupMessage}
                    </p>
                )}

                {!isServerWakingUp && (
                    <>
                        <div>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                aria-label="Upload CSV file"
                                style={{ marginBottom: '10px' }}
                            />
                        </div>
                        <div>
                            <button
                                onClick={() => handleDirectoryChange('mmaforays')}
                                aria-label="Switch to MMAforays directory"
                            >
                                MMAforays
                            </button>
                            <button
                                onClick={() => handleDirectoryChange('uploads')}
                                aria-label="Switch to Uploads directory"
                            >
                                Uploads
                            </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <ul style={{ flex: 1, listStyleType: 'none', padding: 0 }}>
                                {serverFiles.map((file) => (
                                    <li
                                        key={file}
                                        style={{
                                            marginBottom: '10px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span style={{ marginRight: '20px' }}>{file}</span>
                                    </li>
                                ))}
                            </ul>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {serverFiles.map((file) => (
                                    <button
                                        key={`select-${file}`}
                                        onClick={() => handleFileSelect(file)}
                                        aria-label={`Select ${file}`}
                                        style={{ padding: '5px 10px', width: '100px' }}
                                    >
                                        Select
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#f0f0f0'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileManagementModal;