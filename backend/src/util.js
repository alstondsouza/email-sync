const { v4: uuidv4 } = require('uuid');
const { indexUser } = require('./elasticsearch')

const createUserAccount = async (name, email) => {
    const userId = uuidv4();
    await indexUser(userId, name, email);
    return userId;
  };

  module.exports = { createUserAccount };