'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.describeTable('snippets')
        .then(async (attributes) => {
          if (!attributes.tags) {
            await queryInterface.addColumn('snippets', 'tags', {
              type: DataTypes.JSON,
              allowNull: true,
              after: 'name'
            }).then(() => {console.log('added column tags');});
          }
          if (!attributes.headlineText) {
            await queryInterface.addColumn('snippets', 'headlineText', {
              type: DataTypes.TEXT('MEDIUM'),
              allowNull: true,
              after: 'tags'
            }).then(() => {console.log('added column headlineText');});
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
    return await queryInterface.describeTable('snippets')
      .then(async (attributes) => {
        if (attributes.headlineText) {
          await queryInterface.removeColumn('snippets', 'headlineText')
          .then(() => {console.log('removed column headlineText');});
        }
        if (attributes.tags) {
          await queryInterface.removeColumn('snippets', 'tags')
          .then(() => {console.log('removed column tags');});
        }
      })
  }
};
