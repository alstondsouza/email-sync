import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const EmailPage = () => {
    const [emails, setEmails] = useState([]);
    const [userId, setUserId] = useState(null);

    const location = useLocation();

    useEffect(() => {
        // const queryParams = new URLSearchParams(location.search);
        const storedUserId = sessionStorage.getItem('userId');
        setUserId(storedUserId);
        // if (queryParams.get('loggedIn')) {
        //     alert('You are now logged in!');
        // }
        if (storedUserId != null) {
            alert('You are now logged in!');
        }
    }, [location]);

    const fetchEmails = async () => {
        const response = await axios.get('http://localhost:8000/emails?userId='+userId);
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
            <button onClick={fetchEmails}>Fetch Emails</button>
            <ul>
                {emails.map(email => (
                    <li key={email.InternetMessageId}>
                        {email.IsRead ? "Read" : <b>Unread</b>}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Importance:{email.Importance}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Flag:{email.Flag.FlagStatus}
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
                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EmailPage;