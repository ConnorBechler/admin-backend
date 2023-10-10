'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.describeTable('configs')
        .then(async (attributes) => {
          if (attributes.configname) {
            await queryInterface.renameColumn('configs', 'configname', 'name')
              .then(() => {console.log('changed column configname to name');});
          }
          if (attributes.configvalue) {
            await queryInterface.renameColumn('configs', 'configvalue', 'value')
              .then(() => {console.log('changed column configvalue to value');});
            await queryInterface.changeColumn('configs', 'value', {
              type: DataTypes.STRING(255),
              allowNull: true
            })
              .then(() => {console.log('changed column value type');});
          }
          if (!attributes.field) {
            await queryInterface.addColumn('configs', 'field', {
              type: DataTypes.STRING(50),
              allowNull: true,
              defaultValue: 'value',
              after: 'name'
            }).then(() => {console.log('added column field');});
          }
          if (!attributes.json) {
            await queryInterface.addColumn('configs', 'json', {
              type: DataTypes.JSON,
              allowNull: true,
              after: 'value'
            }).then(() => {console.log('added column json');});
          }

          return Promise.resolve();
        })
        .catch((err) => {throw err});


    }

    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    return await queryInterface.describeTable('configs')
      .then(async (attributes) => {
        if (attributes.name) {
          await queryInterface.renameColumn('configs', 'name', 'configname')
            .then(() => {console.log('reverted column name to configname');});
        }
        if (attributes.value) {
          await queryInterface.renameColumn('configs', 'value', 'configvalue')
            .then(() => {console.log('reverted column value to configvalue');});
          await queryInterface.changeColumn('configs', 'configvalue', {
            type: DataTypes.STRING(50),
            allowNull: false
          })
            .then(() => {console.log('reverted column configvalue type');});
        }
        if (attributes.field) {
          await queryInterface.removeColumn('configs', 'field')
            .then(() => {console.log('removed column field');});
        }
        if (attributes.json) {
          await queryInterface.removeColumn('configs', 'json')
            .then(() => {console.log('removed column json');});
        }
      })
  }
};
