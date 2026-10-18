'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      country: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      founded_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      logo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      company_type: {
        type: Sequelize.STRING(20),
        allowNull: false
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('companies');
  }
};
