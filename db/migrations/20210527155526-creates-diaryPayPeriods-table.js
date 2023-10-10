'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.createTable('diaryPayPeriods', {
        id: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        startDate: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        endDate: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        goal: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true
        },
        active: {
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
      .then(() => { console.log('created diaryPayPeriods table'); })
      .catch((err) => { throw err; })

      await queryInterface.addIndex('diaryPayPeriods',
        {
          name: 'startDate',
          fields: ['startDate'],
        }
      )
      .then(() => { console.log('added startDate index'); })
      .catch((err) => { throw err; })

      await queryInterface.addIndex('diaryPayPeriods',
        {
          name: 'endDate',
          fields: ['endDate'],
        }
      )
      .then(() => { console.log('added endDate index'); })
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
    return await queryInterface.dropTable('diaryPayPeriods');
  }
};
