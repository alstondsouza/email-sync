const express = require('express');
const { getOutlookAuthUrl, saveOutlookToken, syncOutlookEmails, getOutlookSignedInUserDetails, getOutlookFolders, subscribeOutlook } = require('./oauth');
const { fetchEmails, updateUserToken, fetchFolders } = require('./elasticsearch');
const { createUserAccount } = require('./util');

const router = express.Router();

router.post('/create_account', async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = await createUserAccount(name, email);
    const outlookAuthUrl = getOutlookAuthUrl(userId);
    res.json({ auth_url: outlookAuthUrl, userId: userId });
  } catch (error) {
    res.status(500).json({ error: 'Error creating account' });
  }
});

router.get('/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query;
    if (!code || !userId) {
      return res.status(400).send('Missing code or state');
    }
    const token = await saveOutlookToken(code);
    await updateUserToken(userId, token);
    const userDetails = await getOutlookSignedInUserDetails(userId, token);
    const folders = await getOutlookFolders(userId, token);
    // const subscribed = await subscribeOutlook(userId, token);
    folders.map(async (folder) =>{
      await syncOutlookEmails(userId, token, folder.id);
    });
    res.redirect('http://localhost:3000/emails?loggedIn=true&displayname='+userDetails.displayName);
  } catch (error) {
    console.log(error.response.data);
    res.status(500).json({ error: 'Error in callback' });
  }
});

// Route to fetch all emails using scroll API
router.get('/emails', async (req, res) => {
  try{
    const userId = req.query.userId;
    let emails = await fetchEmails(userId);
    let folders = await fetchFolders(userId);
    res.json({emails, folders});
  } catch(error){
    res.status(500).send('Error fetching emails');
  }
  
});

router.post('/api/notifications', async (req, res) => {
  const { value } = req.body;
  for (const notification of value) {
    // Process each notification (e.g., fetch the updated email)
    await handleNotification(notification);
  }
  res.status(202).send('Accepted');
});

async function handleNotification(notification) {
  // Fetch the updated email data using notification.resource
  console.log(notification);
}

module.exports = router;
