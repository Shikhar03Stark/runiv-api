'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('link',{
      id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
      },
      owner: {
          type: Sequelize.UUID,
          allowNull: false,
      },
      slug: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      destination: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
              isUrl: true,
          },
      },
      redirects: {
          type: Sequelize.BIGINT,
          defaultValue: 0,
          allowNull: false,
      },
      status: {
          type: Sequelize.ENUM('ACTIVE', 'INACTIVE', "DISABLED"),
          defaultValue: "ACTIVE",
          allowNull: true,
      },
      metric_id: {
          type: Sequelize.UUID,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
  },
      {
          indexes: [
              {
                  unique: true,
                  fields: ['owner', 'slug'],
              }
          ]
      });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('link');
  }
};
