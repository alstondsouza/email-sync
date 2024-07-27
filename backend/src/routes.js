const express = require('express');
const { getOutlookAuthUrl, saveOutlookToken, syncOutlookEmails } = require('./oauth');

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
    console.log(code);
    if (!code) {
      return res.status(400).json({ error: 'Invalid callback request' });
    }
    const token = await saveOutlookToken(code);
    console.log(token);
    await syncOutlookEmails(token);
    res.json({ message: 'Account linked and emails synced' });
  } catch (error) {
    res.status(500).json({ error: 'Error in callback' });
  }
});

module.exports = router;
