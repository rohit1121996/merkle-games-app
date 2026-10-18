'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // SQLite doesn't support ALTER COLUMN directly, so we need to:
    // 1. Create a new temporary column
    // 2. Copy data from old column to new column
    // 3. Drop old column
    // 4. Rename new column to old column name

    // For SQLite, we'll use a simpler approach: recreate the table
    await queryInterface.sequelize.query(`
      CREATE TABLE games_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        genre_id INTEGER NOT NULL,
        platform VARCHAR(100),
        release_date TEXT,
        developer_id INTEGER,
        publisher_id INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (genre_id) REFERENCES genres(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        FOREIGN KEY (developer_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE SET NULL,
        FOREIGN KEY (publisher_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE SET NULL
      );
    `);

    // Copy data from old table to new table
    await queryInterface.sequelize.query(`
      INSERT INTO games_new (id, title, description, genre_id, platform, release_date, developer_id, publisher_id, created_at, updated_at)
      SELECT id, title, description, genre_id, platform, release_date, developer_id, publisher_id, created_at, updated_at
      FROM games;
    `);

    // Drop old table
    await queryInterface.sequelize.query('DROP TABLE games;');

    // Rename new table to old table name
    await queryInterface.sequelize.query('ALTER TABLE games_new RENAME TO games;');

    // Recreate indexes
    await queryInterface.addIndex('games', ['genre_id']);
    await queryInterface.addIndex('games', ['developer_id']);
    await queryInterface.addIndex('games', ['publisher_id']);
    await queryInterface.addIndex('games', ['release_date']);
  },

  async down (queryInterface, Sequelize) {
    // Reverse the migration by changing back to DATETIME
    await queryInterface.sequelize.query(`
      CREATE TABLE games_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        genre_id INTEGER NOT NULL,
        platform VARCHAR(100),
        release_date DATETIME,
        developer_id INTEGER,
        publisher_id INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (genre_id) REFERENCES genres(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        FOREIGN KEY (developer_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE SET NULL,
        FOREIGN KEY (publisher_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE SET NULL
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO games_new (id, title, description, genre_id, platform, release_date, developer_id, publisher_id, created_at, updated_at)
      SELECT id, title, description, genre_id, platform, release_date, developer_id, publisher_id, created_at, updated_at
      FROM games;
    `);

    await queryInterface.sequelize.query('DROP TABLE games;');
    await queryInterface.sequelize.query('ALTER TABLE games_new RENAME TO games;');

    await queryInterface.addIndex('games', ['genre_id']);
    await queryInterface.addIndex('games', ['developer_id']);
    await queryInterface.addIndex('games', ['publisher_id']);
    await queryInterface.addIndex('games', ['release_date']);
  }
};
