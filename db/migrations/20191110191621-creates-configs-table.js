'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.createTable('configs', {
        id: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        configname: {
          type: DataTypes.STRING(50),
          unique: true,
          allowNull: false,
        },
        configvalue: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: true
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: true
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
      })
      .then(() => {
        return Promise.resolve();
      })
      .catch(async (err) => {
        console.log('failed, rolling back');
        await module.exports.down(queryInterface, Sequelize);
        throw err;
      })


    } catch (err) {
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('dropping table');
    return await queryInterface.dropTable('configs');
  }
};
