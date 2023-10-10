'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.describeTable('profiles')
        .then(async (attributes) => {
          if (!attributes.tags) {
            await queryInterface.addColumn('profiles', 'tags', {
              type: DataTypes.JSON,
              allowNull: true,
              after: 'subjectId'
            }).then(() => {console.log('added column tags');});
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
    return await queryInterface.describeTable('profiles')
      .then(async (attributes) => {
        if (attributes.tags) {
          await queryInterface.removeColumn('profiles', 'tags')
          .then(() => {console.log('removed column tags');});
        }
      })
  }
};
