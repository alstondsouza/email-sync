const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200' });

(async () => {
  try {
    const health = await client.cluster.health();
    console.log('Elasticsearch cluster health:', health);
  } catch (err) {
    console.error('Error connecting to Elasticsearch:', err);
  }
})();

async function indexEmails(emails) {
  for (const email of emails) {
    await client.index({
      index: 'emails',
      id: email.Id,
      body: email
    });
  }
}

module.exports = { indexEmails };
