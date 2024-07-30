const express = require('express');
const { getOutlookAuthUrl, saveOutlookToken, syncOutlookEmails } = require('./oauth');
const { fetchEmails, updateUserToken } = require('./elasticsearch');
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
    // const code = req.query.code;
    const { code, state: userId } = req.query;
    if (!code || !userId) {
      return res.status(400).send('Missing code or state');
    }
    // if (!code) {
    //   return res.status(400).json({ error: 'Invalid callback request' });
    // }
    const token = await saveOutlookToken(code);
    await updateUserToken(userId, token);
    await syncOutlookEmails(userId, token);
    res.redirect('http://localhost:3000/emails?loggedIn=true');
  } catch (error) {
    console.log(error.body);
    res.status(500).json({ error: 'Error in callback' });
  }
});

// Route to fetch all emails using scroll API
router.get('/emails', async (req, res) => {
  try{
    const userId = req.query.userId;
    let emails = await fetchEmails(userId);
    res.json(emails);
  } catch(error){
    res.status(500).send('Error fetching emails');
  }
  
});


module.exports = router;
