require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './data/gameapi.sqlite',
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './data/gameapi.sqlite',
    logging: false
  }
};
