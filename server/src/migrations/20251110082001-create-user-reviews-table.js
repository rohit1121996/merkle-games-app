'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_reviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'games',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rating_score: {
        type: Sequelize.REAL,
        allowNull: false
      },
      review_text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      review_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

    await queryInterface.addIndex('user_reviews', ['game_id']);
    await queryInterface.addIndex('user_reviews', ['user_id']);
    await queryInterface.addIndex('user_reviews', ['game_id', 'user_id'], {
      unique: true,
      name: 'unique_user_game_review'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_reviews');
  }
};