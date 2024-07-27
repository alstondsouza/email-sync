const axios = require('axios');
const { indexEmails } = require('./elasticsearch');

const OUTLOOK_CLIENT_ID = '35cbe9d1-4e3e-40e1-b10f-e92a721ddbba';
const OUTLOOK_CLIENT_SECRET = 'd3de8fba-302f-4a15-ab44-321738ca12e5';
const REDIRECT_URI = 'http://localhost:8000/callback/';

function getOutlookAuthUrl() {
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${OUTLOOK_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=openid%20email%20profile%20offline_access%20https://outlook.office.com/Mail.ReadWrite`;
}

async function saveOutlookToken(code) {
  const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  const data = {
    client_id: OUTLOOK_CLIENT_ID,
    scope: 'https://outlook.office.com/Mail.ReadWrite',
    code: code,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    client_secret: OUTLOOK_CLIENT_SECRET
  };
  const response = await axios.post(tokenUrl, new URLSearchParams(data));
  console.log(response);
  return response.data;
}

async function syncOutlookEmails(token) {
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    Accept: 'application/json'
  };
  const response = await axios.get('https://outlook.office.com/api/v2.0/me/messages', { headers });
  console.log(response);
  const emails = response.data.value;
  await indexEmails(emails);
}

module.exports = { getOutlookAuthUrl, saveOutlookToken, syncOutlookEmails };
