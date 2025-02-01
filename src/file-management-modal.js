import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileManagementModal = ({ isOpen, onClose, onFileSelect }) => {
    const [serverFiles, setServerFiles] = useState([]);
    const [currentDirectory, setCurrentDirectory] = useState('mmaforays');

    const apiUrl = process.env.REACT_APP_API_URL;

    const fetchServerFiles = async () => {
        try {
            const response = await axios.get(`${apiUrl}/list_csv_files?directory=${currentDirectory}`);
            setServerFiles(response.data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchServerFiles();
        }
    }, [isOpen, currentDirectory]);

    const handleDirectoryChange = (directory) => {
        setCurrentDirectory(directory);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('directory', 'uploads');

        try {
            await axios.post('${apiUrl}/upload_csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchServerFiles();
            alert('File uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            alert('File upload failed');
        }
    };

    const handleFileSelect = async (filename) => {
        try {
            await onFileSelect(filename, currentDirectory);
            onClose(); // Close the modal after file selection
        } catch (error) {
            console.error('File selection error:', error);
        }
    };

    if (!isOpen) return null;

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
                width: '500px',
                maxHeight: '80%',
                overflowY: 'auto'
            }}>
                <h2>File Management</h2>

                <div>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        style={{ marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <button onClick={() => handleDirectoryChange('mmaforays')}>MMAforays</button>
                    <button onClick={() => handleDirectoryChange('uploads')}>Uploads</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <ul style={{ flex: 1, listStyleType: 'none', padding: 0 }}>
                        {serverFiles.map((file) => (
                            <li key={file} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '20px' }}>{file}</span>
                            </li>
                        ))}
                    </ul>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {serverFiles.map((file) => (
                            <button
                                key={`select-${file}`}
                                onClick={() => handleFileSelect(file)}
                                style={{ padding: '5px 10px', width: '100px' }}
                            >
                                Select
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <button
                        onClick={onClose}
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