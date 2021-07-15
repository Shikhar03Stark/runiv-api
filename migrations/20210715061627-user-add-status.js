'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('user', 'status', {
      type: Sequelize.ENUM('VERIFIED', 'PENDING', 'SUSPENDED'),
      allowNull: false,
      defaultValue: 'PENDING',
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('user', 'status');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_user_status";`);
  }
};
