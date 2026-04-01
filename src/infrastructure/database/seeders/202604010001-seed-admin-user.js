'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const email = process.env.ADMIN_EMAIL || 'admin@boilerplate.local';
    const plainPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        email,
        password_hash: passwordHash,
        role: 'admin',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    const email = process.env.ADMIN_EMAIL || 'admin@boilerplate.local';
    await queryInterface.bulkDelete('users', { email });
  },
};
