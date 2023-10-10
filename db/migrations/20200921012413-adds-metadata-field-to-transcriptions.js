'use strict';
const { transcriptions } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.describeTable('transcriptions')
        .then(async (attributes) => {
          if (!attributes.metadata) {
            await queryInterface.addColumn('transcriptions', 'metadata', {
              type: DataTypes.JSON,
              allowNull: true,
              after: 'content'
            }).then(async () => {
              console.log('added column metadata');

              await transcriptions.update({ metadata: {} }, { where: { metadata: null } })
                .then(() => {console.log('set all transcript default metadata to {}')})
                .catch((err) => {throw err});
            });
          }
          return Promise.resolve();
        })
        .catch(async (err) => {
          throw err;
        });


    } catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.describeTable('transcriptions')
      .then(async (attributes) => {
        if (attributes.metadata) {
          await queryInterface.removeColumn('transcriptions', 'metadata')
          .then(() => {console.log('removed column metadata');});
        }
      })
  }
};
