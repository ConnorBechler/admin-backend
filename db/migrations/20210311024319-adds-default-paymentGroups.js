'use strict';
const { paymentGroups } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await paymentGroups.create({
        id: '99999999-9999-9999-9999-999999999999',
        name: 'Me',
        shortName: 'Self',
        hidden: 1
      })
      .then((participantCategory) => {console.log('added participantCategory -', participantCategory.name, participantCategory.id)})
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
    await paymentGroups.destroy({where: {shortName: 'Self'}, force: true})
      .then((participantCategory) => {console.log('removed participantCategory - Self')})
      .catch((err) => {throw err});
  }
};
