'use strict';
const { configs } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await configs.create({
        name: 'systemEnabled',
        field: 'value',
        value: 1
      })
      .then((config) => {console.log('added config -', config.name)})
      .catch((err) => {throw err});
      
      await configs.create({
        name: 'registrationOpen',
        field: 'value',
        value: 0
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
    await configs.destroy({where: {name: 'registrationOpen'}, force: true})
      .then(() => {console.log('removed config - registrationOpen')})
      .catch((err) => {throw err});
    await configs.destroy({where: {name: 'systemEnabled'}, force: true})
      .then(() => {console.log('removed config - systemEnabled')})
      .catch((err) => {throw err});
  }
};
