const express = require('express');
const { getOutlookAuthUrl, saveOutlookToken, syncOutlookEmails } = require('./oauth');
const { fetchEmails } = require('./elasticsearch');

const router = express.Router();

router.post('/create_account', async (req, res) => {
  try {
    const outlookAuthUrl = getOutlookAuthUrl();
    res.json({ auth_url: outlookAuthUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error creating account' });
  }
});

router.get('/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: 'Invalid callback request' });
    }
    const token = await saveOutlookToken(code);
    await syncOutlookEmails(token);
    // res.json({ message: 'Account linked and emails synced' });
    res.redirect('http://localhost:3000/emails?loggedIn=true');
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error in callback' });
  }
});

// Route to fetch all emails using scroll API
router.get('/emails', async (req, res) => {
  try{
    let emails = await fetchEmails();
    res.json(emails);
  } catch(error){
    res.status(500).send('Error fetching emails');
  }
  
});


module.exports = router;
