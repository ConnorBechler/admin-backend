'use strict';
const { configs } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await configs.create({
        name: 'signupNotificationAddresses',
        field: 'json',
        json: []
      })
      .then((config) => {console.log('added config -', config.name)})
      .catch((err) => {throw err});

      return Promise.resolve();
    }
    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await configs.destroy({where: {name: 'signupNotificationAddresses'}, force: true})
      .then(() => {console.log('removed config - signupNotificationAddresses')})
      .catch((err) => {throw err});
  }
};
