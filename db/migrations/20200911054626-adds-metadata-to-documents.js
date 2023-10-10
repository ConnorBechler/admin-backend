'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.describeTable('documents')
        .then(async (attributes) => {
          if (!attributes.metadata) {
            await queryInterface.addColumn('documents', 'metadata', {
              type: DataTypes.JSON,
              allowNull: true,
              after: 'size'
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
    return await queryInterface.describeTable('documents')
      .then(async (attributes) => {
        if (attributes.metadata) {
          await queryInterface.removeColumn('documents', 'metadata')
          .then(() => {console.log('removed column metadata');});
        }
      })
  }
};
