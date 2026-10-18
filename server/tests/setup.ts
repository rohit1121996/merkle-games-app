// Set test environment variables
// Integration tests should use the seeded database file
// Unit tests can use in-memory database
// Set USE_SEEDED_DB=true environment variable for integration tests
if (process.env.USE_SEEDED_DB === 'true') {
  // Use development environment with seeded SQLite database for integration tests
  process.env.NODE_ENV = 'development';
  process.env.DB_STORAGE = process.env.DB_STORAGE || './data/gameapi.sqlite';
} else {
  // Use test environment with in-memory database for unit tests
  process.env.NODE_ENV = 'test';
}

process.env.JWT_SECRET = 'test-secret-key';

// Suppress console logs during tests unless explicitly needed
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
}