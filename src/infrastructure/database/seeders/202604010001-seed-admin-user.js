'use strict';

/* eslint-disable @typescript-eslint/no-require-imports */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  // Inserts the initial admin user from environment credentials.
  async up(queryInterface) {
    const now = new Date();
    const email = process.env.ADMIN_EMAIL;
    const plainPassword = process.env.ADMIN_PASSWORD;

    if (!email || !plainPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
    }

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

  // Removes seeded admin user by ADMIN_EMAIL.
  async down(queryInterface) {
    const email = process.env.ADMIN_EMAIL;

    if (!email) {
      throw new Error('ADMIN_EMAIL must be defined in .env');
    }

    await queryInterface.bulkDelete('users', { email });
  },
};
