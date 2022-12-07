'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     */
    return queryInterface.bulkInsert('templates', [
      {
        id_template: 1,
        template_name: 'Basic',
        image: 'http://localhost:5000/public/template_1.png',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_template: 2,
        template_name: 'Blue Sea',
        image: 'http://localhost:5000/public/template_2.png',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_template: 3,
        template_name: 'Sunset',
        image: 'http://localhost:5000/public/template_3.png',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id_template: 4,
        template_name: 'Online Shop',
        image: 'http://localhost:5000/public/template_4.png',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     */
    return queryInterface.bulkDelete('templates', null, {});
  },
};
