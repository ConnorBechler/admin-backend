'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.createTable('processingJobs', {
        id: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        remoteWorkerId: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          allowNull: false,
        },
        transcriptionId: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          allowNull: false,
        },
        status: {
          type: DataTypes.INTEGER(3),
          allowNull: false,
          defaultValue: 0,
        },
        metadata: {
          type: DataTypes.JSON,
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
      .then(() => { console.log('created processingJobs table'); })
      .catch((err) => { throw err; })

      await queryInterface.addIndex('processingJobs',
        {
          name: 'remoteWorkerId',
          fields: ['remoteWorkerId'],
        }
      )
      .then(() => { console.log('added remoteWorkerId index'); })
      .catch((err) => { throw err; })

      await queryInterface.addIndex('processingJobs',
        {
          name: 'transcriptionId',
          fields: ['transcriptionId'],
        }
      )
      .then(() => { console.log('added transcriptionId index'); })
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
    return await queryInterface.dropTable('processingJobs');
  }
};
