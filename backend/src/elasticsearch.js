const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: 'http://localhost:9200' });

async function indexEmails(emails) {
  for (const email of emails) {
    await client.index({
      index: 'emails',
      id: email.Id,
      document: email
    });
  }
}

module.exports = { indexEmails };
