import { config } from 'dotenv';
import { Options } from 'sequelize';

config();

interface DatabaseConfig {
  [key: string]: Options;
}

const databaseConfig: DatabaseConfig = {
  development: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './data/gameapi.sqlite',
    logging: false,
    dialectOptions: {
      // Enable Write-Ahead Logging for better concurrency
      mode: 3 // OPEN_READWRITE | OPEN_CREATE
    },
    pool: {
      max: 1,
      min: 0,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './data/gameapi.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
};

export default databaseConfig;
