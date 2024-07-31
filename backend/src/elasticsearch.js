const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200' });

// (async () => {
//   try {
//     const health = await client.cluster.health();
//     console.log('Elasticsearch cluster health:', health);
//   } catch (err) {
//     console.error('Error connecting to Elasticsearch:', err);
//   }
// })();

async function indexEmails(emails, userId, folderId) {
  for (const email of emails) {
    email.userId = userId;
    email.folderId = folderId;
    await client.index({
      index: 'emails',
      id: email.id,
      body: email
    });
  }
}

async function fetchEmails(userId) {
  try {
    let emails = [];
    const { body: initBody } = await client.search({
        index: 'emails',
        scroll: '1m',
        body: {
            query: {
              match: { userId }
            },
            sort: [{ CreatedDateTime: { order: 'desc' } }]
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

async function indexUser(userId, name, email) {
    await client.index({
      index: 'users',
      id: userId,
      body: {
        "email":email,
        "name":name,
        "userId":userId
      }
    });
}

async function updateUserToken(userId, token) {
  await client.update({
    index: 'users',
    id: userId,
    body: {
      doc: {token}
    }
  });
}

async function updateUserDetails(userId, userDetails) {
  await client.update({
    index: 'users',
    id: userId,
    body: {
      doc: {userDetails}
    }
  });
}

async function updateFolderDetails(userId, folderInfo) {
  for (const folder of folderInfo) {
    folder.userId = userId;
    await client.index({
      index: 'folders',
      id: folder.id,
      body: folder
    });
  }
}

async function fetchFolders(userId) {
  try {
    let folders = [];
    const { body: initBody } = await client.search({
        index: 'folders',
        scroll: '1m',
        body: {
            query: {
              match: { userId }
            }
        }
    });

    folders = folders.concat(initBody.hits.hits.map(hit => hit._source));

    let scrollId = initBody._scroll_id;
    let fetchedFolders = initBody.hits.hits.length;

    while (fetchedFolders > 0) {
        const { body: scrollBody } = await client.scroll({
            scroll_id: scrollId,
            scroll: '1m'
        });

        folders = folders.concat(scrollBody.hits.hits.map(hit => hit._source));
        scrollId = scrollBody._scroll_id;
        fetchedFolders = scrollBody.hits.hits.length;
    }

    return folders;

} catch (err) {
    console.error('Error fetching folders:', err);
}
}

module.exports = { 
  indexEmails, 
  fetchEmails, 
  indexUser, 
  updateUserToken, 
  updateUserDetails,
  updateFolderDetails,
  fetchFolders
};
