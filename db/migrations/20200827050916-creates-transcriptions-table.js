'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.createTable('transcriptions', {
        id: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        documentId: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          allowNull: true,
        },
        status: {
          type: DataTypes.INTEGER(3),
          allowNull: false,
          defaultValue: 0,
        },
        revision: {
          type: DataTypes.INTEGER(3),
          allowNull: false,
          defaultValue: 1,
        },
        edited: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        content: {
          type: DataTypes.JSON,
          allowNull: true
        },
        hidden: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
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
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('transcriptions', { id: Sequelize.INTEGER });
    */
  },

  down: async (queryInterface, Sequelize) => {
    console.log('dropping table');
    return await queryInterface.dropTable('transcriptions');
  }
};
