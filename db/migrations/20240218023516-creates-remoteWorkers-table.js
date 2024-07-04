'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.createTable('remoteWorkers', {
        id: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        secret: {
          type: DataTypes.STRING(64) + ' CHARSET utf8',
          allowNull: false,
        },
        maxConcurrent: {
          type: DataTypes.INTEGER(4),
          allowNull: false,
          defaultValue: 10,
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false
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
      .then(() => { console.log('created remoteWorkers table'); })
      .catch((err) => { throw err; })

      await queryInterface.addIndex('remoteWorkers',
        {
          name: 'secret',
          fields: ['secret'],
        }
      )
      .then(() => { console.log('added secret index'); })
      .catch((err) => { throw err; })


      return Promise.resolve();
    } catch (err) {
      console.log('failed, rolling back', err);
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('dropping table');
    return await queryInterface.dropTable('remoteWorkers');
  }
};
