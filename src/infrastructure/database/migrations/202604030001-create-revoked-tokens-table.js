'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('revoked_tokens', {
      jti: {
        type: Sequelize.STRING(64),
        allowNull: false,
        primaryKey: true,
      },
      token_type: {
        type: Sequelize.ENUM('access', 'refresh'),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('revoked_tokens', ['expires_at'], {
      name: 'revoked_tokens_expires_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('revoked_tokens');
  },
};
