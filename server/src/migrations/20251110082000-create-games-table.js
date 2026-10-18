'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      genre_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'genres',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      platform: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      release_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      developer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      publisher_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('games', ['genre_id']);
    await queryInterface.addIndex('games', ['developer_id']);
    await queryInterface.addIndex('games', ['publisher_id']);
    await queryInterface.addIndex('games', ['release_date']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('games');
  }
};