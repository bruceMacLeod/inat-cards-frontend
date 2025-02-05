import React, { useEffect } from 'react';
import axios from 'axios';

const WakeupPoller = () => {
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const wakeupInterval = 14 * 60 * 1000; // 14 minutes in milliseconds

        // Function to call the /wakeup endpoint
        const callWakeup = async () => {
            try {
                const response = await axios.get(`${apiUrl}/wakeup`);
                console.log('Server wakeup call successful:', response.status);
            } catch (error) {
                console.error('Error calling /wakeup:', error);
            }
        };

        // Call /wakeup immediately when the component mounts
        callWakeup();

        // Set up the interval to call /wakeup every 14 minutes
        const intervalId = setInterval(callWakeup, wakeupInterval);

        // Clean up the interval when the component unmounts
        return () => {
            clearInterval(intervalId);
        };
    }, [apiUrl]);

    return null; // This component doesn't render anything
};

export default WakeupPoller;