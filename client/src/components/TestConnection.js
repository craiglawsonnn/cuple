import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000';

function TestConnection() {
    const [status, setStatus] = useState('Testing connection...');

    useEffect(() => {
        const testConnection = async () => {
            try {
                const response = await fetch(`${API_URL}/api/test`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setStatus(`Connected: ${data.message}`);
            } catch (error) {
                setStatus(`Error: ${error.message}`);
            }
        };

        testConnection();
    }, []);

    return <div>{status}</div>;
}

export default TestConnection; 