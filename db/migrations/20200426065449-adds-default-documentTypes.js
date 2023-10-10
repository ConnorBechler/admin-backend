'use strict';
const { documentTypes } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await documentTypes.create({
        name: 'Audio',
        shortName: 'AUDIO'
      })
      .then((documentType) => {console.log('added documentType -', documentType.name, documentType.id)})
      .catch((err) => {throw err});
      await documentTypes.create({
        name: 'Photo',
        shortName: 'IMAGE'
      })
      .then((documentType) => {console.log('added documentType -', documentType.name, documentType.id)})
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
    await documentTypes.destroy({where: {shortName: 'IMAGE'}, force: true})
      .then((documentType) => {console.log('removed documentType - IMAGE')})
      .catch((err) => {throw err});
    await documentTypes.destroy({where: {shortName: 'AUDIO'}, force: true})
      .then((documentType) => {console.log('removed documentType - AUDIO')})
      .catch((err) => {throw err});
  }
};
