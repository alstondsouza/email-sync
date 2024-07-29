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
    console.log(response.data);
    setEmails(response.data);
  };

  const viewEmailContent = async (htmlContent) => {
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };

  return (
    <div>
      <button onClick={createAccount}>Link Outlook Account</button>
      {authUrl && <a href={authUrl}>Login with Outlook</a>}
      <button onClick={fetchEmails}>Fetch Emails</button>
      <ul>
        {emails.map(email => (
          <li key={email.Id}>
            {email.IsRead ? "Read" : <b>Unread</b>}
            <br /> - From: <br />
            <a href={`mailto:${email.From.EmailAddress.Address}`}
              target="_blank"
              rel="noopener noreferrer">
              {email.From.EmailAddress.Name}
            </a>
            <br /> - To: <br />
            {email.ToRecipients.map(toEmail => (
              <a href={`mailto:${toEmail.EmailAddress.Address}`}
                target="_blank"
                rel="noopener noreferrer">
                {toEmail.EmailAddress.Name},&nbsp;
              </a>
            ))}
            <br />Subject: {email.Subject} &nbsp;&nbsp;
            <button onClick={() => viewEmailContent(email.Body.Content)} type="button">View Content</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
