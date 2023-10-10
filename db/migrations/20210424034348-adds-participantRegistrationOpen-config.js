'use strict';
const { configs } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await configs.create({
        name: 'participantRegistrationOpen',
        value: 1
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
    await configs.destroy({where: {name: 'participantRegistrationOpen'}, force: true})
      .then(() => {console.log('removed config - participantRegistrationOpen')})
      .catch((err) => {throw err});
  }
};
