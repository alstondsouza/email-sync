const axios = require('axios');
const {
  indexEmails,
  updateUserDetails,
  updateFolderDetails,
  fetchToken,
  updateEmails,
  deleteEmails } = require('./elasticsearch');

const OUTLOOK_CLIENT_ID = '35cbe9d1-4e3e-40e1-b10f-e92a721ddbba';
const OUTLOOK_CLIENT_SECRET = '9lc8Q~du-lCydRV.5A3MDlNV4Gpcm2EIBkpsIbKx';
const REDIRECT_URI = 'http://localhost:8000/callback/';

const scopes = 'User.Read Mail.Read Mail.ReadWrite';

function getOutlookAuthUrl(userId) {
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${OUTLOOK_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=${encodeURIComponent(scopes)}&state=${userId}`;
  return authUrl;
  // return `         https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${OUTLOOK_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=openid%20email%20profile%20offline_access%20https://graph.microsoft.com/Mail.ReadWrite&state=${userId}`;
}

async function saveOutlookToken(code) {
  const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  const data = {
    client_id: OUTLOOK_CLIENT_ID,
    scope: scopes,
    code: code,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    client_secret: OUTLOOK_CLIENT_SECRET
  };
  const response = await axios.post(tokenUrl, new URLSearchParams(data));
  return response.data;
}

async function syncOutlookEmails(userId, token, folderId) {
  let nextLink = `https://graph.microsoft.com/v1.0/me/mailfolders/${folderId}/messages`;
  const emails = [];
  while (nextLink) {
    const response = await fetch(nextLink, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Accept': 'application/json'
      }
    });

    if (response.status === 200) {
      const data = await response.json();
      emails.push(...data.value);
      nextLink = data['@odata.nextLink']; // Next page link
    } else if (response.status === 429) {
      // Handle rate limiting as discussed
      const retryAfter = response.headers.get('Retry-After') || 1;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    } else {
      throw new Error('Failed to fetch emails');
    }
  }
  await indexEmails(emails, userId, folderId);
}

async function getOutlookSignedInUserDetails(userId, token) {
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    Accept: 'application/json'
  };
  const response = await axios.get('https://graph.microsoft.com/v1.0/me', { headers });
  const userDetails = response.data;
  await updateUserDetails(userId, userDetails);
  return userDetails;
}

async function getOutlookFolders(userId, token) {
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    Accept: 'application/json'
  };
  const response = await axios.get('https://graph.microsoft.com/v1.0/me/mailfolders', { headers });
  const folderInfo = response.data.value;
  await updateFolderDetails(userId, folderInfo);
  return folderInfo;
}

async function subscribeOutlook(userId, token) {
  const notifUrl = `https://graph.microsoft.com/v1.0/subscriptions`
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    Accept: 'application/json'
  };
  const data = {
    "changeType": "created,updated,deleted",
    "notificationUrl": "https://6b15-103-130-108-166.ngrok-free.app/api/notifications",
    "resource": "/me/messages",
    "expirationDateTime": "2024-08-02T18:23:45.9356913Z",
    "clientState": userId
  }
  const response = await axios.post(notifUrl, data, { headers });
  // console.log("Subscribed", response.data);
}

async function handleNotification(notification) {
  const userId = notification.clientState;
  const token = await fetchToken(userId);
  try {
    // Update your application with the new message details
    if (notification.changeType == 'created' || notification.changeType == 'updated') {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/${notification.resource}`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`
          }
        }
      );
      const messageDetails = response.data;
      await updateEmails(userId, messageDetails);
    }
    else if (notification.changeType == 'deleted') {
      try {
        await deleteEmails(notification);
      } catch (error) {
        console.log("delete error", error);
      }
    }
    else {
      console.log("No matching changeType")
    }
  } catch (error) {
    // console.error('Error fetching resource details:', error);
  }
}

module.exports = {
  getOutlookAuthUrl,
  saveOutlookToken,
  syncOutlookEmails,
  getOutlookSignedInUserDetails,
  getOutlookFolders,
  subscribeOutlook,
  handleNotification
};
