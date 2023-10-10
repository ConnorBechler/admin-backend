'use strict';
const { participantCategories } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await participantCategories.create({
        name: 'Adult',
        shortName: 'Adult',
        sortOrder: 1
      })
      .then((participantCategory) => {console.log('added participantCategory -', participantCategory.name, participantCategory.id)})
      .catch((err) => {throw err});
      await participantCategories.create({
        name: 'Teen',
        shortName: 'Teen',
        sortOrder: 2
      })
      .then((participantCategory) => {console.log('added participantCategory -', participantCategory.name, participantCategory.id)})
      .catch((err) => {throw err});
      await participantCategories.create({
        name: 'Kid',
        shortName: 'Kid',
        sortOrder: 3
      })
      .then((participantCategory) => {console.log('added participantCategory -', participantCategory.name, participantCategory.id)})
      .catch((err) => {throw err});
      await participantCategories.create({
        name: 'Team (Internal)',
        shortName: 'Team',
        sortOrder: 98
      })
      .then((participantCategory) => {console.log('added participantCategory -', participantCategory.name, participantCategory.id)})
      .catch((err) => {throw err});
      await participantCategories.create({
        name: 'Test Data (ignore)',
        shortName: 'Test',
        sortOrder: 99
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
    await participantCategories.destroy({where: {shortName: 'Test'}, force: true})
      .then((participantCategory) => {console.log('removed participantCategory - Test')})
      .catch((err) => {throw err});
    await participantCategories.destroy({where: {shortName: 'Team'}, force: true})
      .then((participantCategory) => {console.log('removed participantCategory - Team')})
      .catch((err) => {throw err});
    await participantCategories.destroy({where: {shortName: 'Kid'}, force: true})
      .then((participantCategory) => {console.log('removed participantCategory - Kid')})
      .catch((err) => {throw err});
    await participantCategories.destroy({where: {shortName: 'Teen'}, force: true})
      .then((participantCategory) => {console.log('removed participantCategory - Teen')})
      .catch((err) => {throw err});
    await participantCategories.destroy({where: {shortName: 'Adult'}, force: true})
      .then((participantCategory) => {console.log('removed participantCategory - Adult')})
      .catch((err) => {throw err});
  }
};
