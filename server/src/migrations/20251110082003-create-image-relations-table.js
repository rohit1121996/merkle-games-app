'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('image_relations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      image_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'images',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      related_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      related_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_date: {
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

    await queryInterface.addIndex('image_relations', ['image_id']);
    await queryInterface.addIndex('image_relations', ['related_type', 'related_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('image_relations');
  }
};