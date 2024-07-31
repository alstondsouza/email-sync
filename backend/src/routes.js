const express = require('express');
const { getOutlookAuthUrl, saveOutlookToken, syncOutlookEmails, getOutlookSignedInUserDetails, getOutlookFolders } = require('./oauth');
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
    folders.map(async (folder) =>{
      await syncOutlookEmails(userId, token, folder.Id);
    });
    res.redirect('http://localhost:3000/emails?loggedIn=true&displayname='+userDetails.DisplayName);
  } catch (error) {
    console.log(error);
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


module.exports = router;
