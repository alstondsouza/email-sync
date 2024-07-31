const axios = require('axios');
const { indexEmails, updateUserDetails, updateFolderDetails } = require('./elasticsearch');

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

async function subscribeOutlook(userId, token){
  const notifUrl = `https://graph.microsoft.com/v1.0/subscriptions`
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    Accept: 'application/json'
  };
  const data={
    "changeType": "created,updated,deleted",
    "notificationUrl": "http://localhost:8000/api/notifications",
    "resource": "/me/mailFolders('inbox')/messages",
    "expirationDateTime":"2024-08-01T18:23:45.9356913Z",
    "clientState": "emailSyncCoreApp"
  }
  const response = await axios.post(notifUrl, { headers: headers }, data);
  console.log("Subscribed", response);
}

module.exports = {
  getOutlookAuthUrl,
  saveOutlookToken,
  syncOutlookEmails,
  getOutlookSignedInUserDetails,
  getOutlookFolders,
  subscribeOutlook
};
