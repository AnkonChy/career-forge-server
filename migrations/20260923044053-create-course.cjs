"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("courses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      slug: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.DECIMAL,
      },
      discount_price: {
        type: Sequelize.DECIMAL,
      },
      level: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      is_free: {
        type: Sequelize.BOOLEAN,
      },
      instructor_name: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("courses");
  },
};
