const express = require('express');
const { getOutlookAuthUrl,
  saveOutlookToken,
  syncOutlookEmails,
  getOutlookSignedInUserDetails,
  getOutlookFolders,
  subscribeOutlook,
  handleNotification } = require('./oauth');
const { fetchEmails, updateUserToken, fetchFolders } = require('./elasticsearch');
const { createUserAccount } = require('./util');
const { broadcastMessage } = require('./wsServer');

const router = express.Router();

router.post('/create_account', async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = await createUserAccount(name, email);
    const outlookAuthUrl = getOutlookAuthUrl(userId);
    res.json({ auth_url: outlookAuthUrl, userId: userId });
  } catch (error) {
    console.log(error);
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
    folders.map(async (folder) => {
      await syncOutlookEmails(userId, token, folder.id);
    });
    await subscribeOutlook(userId, token);
    res.redirect('http://localhost:3000/emails?loggedIn=true&displayname=' + userDetails.displayName);
  } catch (error) {
    console.log(error.response.data);
    res.status(500).json({ error: 'Error in callback' });
  }
});

// Route to fetch all emails using scroll API
router.get('/emails', async (req, res) => {
  try {
    const userId = req.query.userId;
    let emails = await fetchEmails(userId);
    let folders = await fetchFolders(userId);
    res.json({ emails, folders });
  } catch (error) {
    res.status(500).send('Error fetching emails');
  }
});

// router.get('/subscribe', async (req, res) => {
//   try {
//     const userId = req.query.userId;
//     const token = await fetchToken(userId);
//     const subscribed = await subscribeOutlook(userId, token);
//     res.json({ 
//       "subscribe": "success",
//       subscribed
//     });
//   } catch (error) {
//     res.status(500).send('Error subscribing');
//   }

// });
// 
router.post('/api/notifications', async (req, res) => {
  try {
    const { value } = req.body;
    if (value) {
      for (const notification of value) {
        // Process each notification (e.g., fetch the updated email)
        await handleNotification(notification);
        const userId = notification.clientState;
        const emails = await fetchEmails(userId);
        const folders = await fetchFolders(userId);
        broadcastMessage({ userId, emails, folders });
      }
      res.status(200).send('OK');
    }
    else {
      const validationToken = req.query.validationToken;
      res.status(200).send(validationToken);
    }
    // res.status(202).send('Accepted');
  } catch (error) {
    console.log(error);
  }
});

router.get('/logout', async (req, res) => {
  try {
    const userId = req.query.userId;
    await updateUserToken(userId, { token: {} });
    res.json({ "logout": "success" });
  } catch (error) {
    res.status(500).send('Error logging out');
  }
});

module.exports = router;
