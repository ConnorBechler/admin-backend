'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.describeTable('diaries')
        .then(async (attributes) => {
          if (!attributes.tags) {
            await queryInterface.addColumn('diaries', 'tags', {
              type: DataTypes.JSON,
              allowNull: true,
              after: 'profileId'
            }).then(() => {console.log('added column tags');});
          }
          if (!attributes.metadata) {
            await queryInterface.addColumn('diaries', 'metadata', {
              type: DataTypes.JSON,
              allowNull: true,
              after: 'tags'
            }).then(() => {console.log('added column metadata');});
          }

          return Promise.resolve();
        })
        .catch(async (err) => {
          console.log('failed, rolling back');
          await module.exports.down(queryInterface, Sequelize);
          throw err;
        });


    } catch (err) {
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.describeTable('diaries')
      .then(async (attributes) => {
        if (attributes.metadata) {
          await queryInterface.removeColumn('diaries', 'metadata')
          .then(() => {console.log('removed column metadata');});
        }
        if (attributes.tags) {
          await queryInterface.removeColumn('diaries', 'tags')
          .then(() => {console.log('removed column tags');});
        }
      })
  }
};
