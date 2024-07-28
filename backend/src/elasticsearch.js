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

async function fetchEmails() {
  try {
    let emails = [];
    const { body: initBody } = await client.search({
        index: 'emails',
        scroll: '1m',
        body: {
            query: {
                match_all: {}
            }
        }
    });

    emails = emails.concat(initBody.hits.hits.map(hit => hit._source));

    let scrollId = initBody._scroll_id;
    let fetchedEmails = initBody.hits.hits.length;

    while (fetchedEmails > 0) {
        const { body: scrollBody } = await client.scroll({
            scroll_id: scrollId,
            scroll: '1m'
        });

        emails = emails.concat(scrollBody.hits.hits.map(hit => hit._source));
        scrollId = scrollBody._scroll_id;
        fetchedEmails = scrollBody.hits.hits.length;
    }

    return emails;

} catch (err) {
    console.error('Error fetching emails:', err);
}
}

module.exports = { indexEmails, fetchEmails };
