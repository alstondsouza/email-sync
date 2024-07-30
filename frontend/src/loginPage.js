import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
    const [authUrl, setAuthUrl] = useState('');

    const createAccount = async () => {
        const response = await axios.post('http://localhost:8000/create_account/', {});
        setAuthUrl(response.data.auth_url);
    };

    return (
        <div>
            <button onClick={createAccount}>Link Outlook Account</button>
            {authUrl && <a href={authUrl}>Login with Outlook</a>}
        </div>
    );
}

export default LoginPage;