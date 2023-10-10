'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.createTable('documents', {
        id: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        parentId: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          allowNull: true
        },
        documentTypeId: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          allowNull: true
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        originalname: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        mimetype: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        fileext: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        size: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        visibility: {
          type: DataTypes.STRING(20),
          allowNull: true
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
    return await queryInterface.dropTable('documents');
  }
};
