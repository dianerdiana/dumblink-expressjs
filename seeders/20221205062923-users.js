'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     */
    return queryInterface.bulkInsert('users', [
      {
        fullname: 'Admin',
        email: 'admin@mail.com',
        password:
          '$2a$10$32/RZ0enXeZ5cYb1MhNAqeow50Evrtt0CT2WXOUxyT/tnWAsPApve',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     */
    return queryInterface.bulkDelete('users', null, {});
  },
};
