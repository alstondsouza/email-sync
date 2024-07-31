import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const EmailPage = () => {
    const [emails, setEmails] = useState([]);
    const [folders, setfolders] = useState([]);
    const [userId, setUserId] = useState(null);
    const [displayname, setDisplayName] = useState(null);

    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const DisplayName = queryParams.get('displayname');
        setDisplayName(DisplayName);
        const storedUserId = sessionStorage.getItem('userId');
        setUserId(storedUserId);
        if (storedUserId != null) {
            alert('You are now logged in!');
        }
    }, [location]);

    const fetchEmails = async () => {
        const response = await axios.get('http://localhost:8000/emails?userId=' + userId);
        console.log(response.data);
        setEmails(response.data.emails);
        setfolders(response.data.folders);
    };

    const viewEmailContent = async (htmlContent) => {
        const newWindow = window.open('', '_blank', 'width=800,height=600');
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    };

    return (
        <div>
            <button onClick={fetchEmails}>Fetch Emails</button>
            <h1>Welcome {displayname}</h1>
            <ul>
                {folders.map(folder => (
                    <li key={folder.id}>
                        {folder.displayName} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        No. of mails: {folder.totalItemCount} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        No. of unread mails:{folder.unreadItemCount}
                        <hr /><hr />
                        <ul>
                            {emails.map(email => {
                                if (email.folderId === folder.id) {
                                    return (
                                        <li key={email.id}>
                                            {email.isRead ? "Read" : <b>Unread</b>}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Importance:{email.importance}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Flag:{email.flag.flagStatus}
                                            {email.from ?
                                                <div>
                                                    <br /> - From: <br />
                                                    <a href={`mailto:${email.from.emailAddress.address}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer">
                                                        {email.from.emailAddress.name}
                                                    </a>
                                                </div>
                                                :
                                                <div>

                                                </div>}
                                            <br /> - To: <br />
                                            {email.toRecipients.map(toEmail => (
                                                <a href={`mailto:${toEmail.emailAddress.address}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer">
                                                    {toEmail.emailAddress.name},&nbsp;
                                                </a>
                                            ))}
                                            <br />Subject: {email.subject} &nbsp;&nbsp;
                                            <button onClick={() => viewEmailContent(email.body.content)} type="button">View Content</button>
                                            <hr />
                                        </li>
                                    );
                                }
                                else {
                                    return (null);
                                }
                            })}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EmailPage;