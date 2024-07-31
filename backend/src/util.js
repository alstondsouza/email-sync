const { v4: uuidv4 } = require('uuid');
const { indexUser } = require('./elasticsearch')

const createUserAccount = async (name, email) => {
    const userId = uuidv4();
    await indexUser(userId, name, email);
    return userId;
  };

  // const fetchWithExponentialBackoff = async (url, options, retries = 5, delay = 1000,response) => {
  //   try {
  //     const response = await fetch(url, options);
  //     if (response.status === 429 && retries > 0) {
  //       const retryAfter = response.headers.get('retry-after') || delay;
  //       await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  //       return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
  //     }
  //     return response;
  //   } catch (error) {
  //     if (retries > 0) {
  //       await new Promise(resolve => setTimeout(resolve, delay));
  //       return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
  //     } else {
  //       throw error;
  //     }
  //   }
  // };

  module.exports = { createUserAccount };