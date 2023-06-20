'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Companies', 'name', {
      type: Sequelize.STRING,
      allowNull: false

    });
    await queryInterface.addColumn('Companies', 'id', {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID
    });
    await queryInterface.changeColumn('Companies', 'website', {
      type: Sequelize.STRING,
      allowNull: false,

    });
    await queryInterface.changeColumn('Companies', 'industry', {
      allowNull: false,
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('Companies', 'subIndustry', {
      allowNull: true,
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('Companies', 'revenue', {
      allowNull: false,
      type: Sequelize.STRING,
    });

    await queryInterface.renameColumn('Companies', 'companySize', 'size', {
      allowNull: false,
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
