// frontend/src/app.js

import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [authUrl, setAuthUrl] = useState('');
  const [emails, setEmails] = useState([]);

  const createAccount = async () => {
    const response = await axios.post('http://localhost:8000/create_account/', {});
    setAuthUrl(response.data.auth_url);
  };

  const fetchEmails = async () => {
    const response = await axios.get('http://localhost:8000/emails');
    setEmails(response.data);
  };

  return (
    <div>
      <button onClick={createAccount}>Link Outlook Account</button>
      {authUrl && <a href={authUrl}>Login with Outlook</a>}
      <button onClick={fetchEmails}>Fetch Emails</button>
      <ul>
        {emails.map(email => (
          <li key={email.id}>{email.subject} - {email.sender}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
