'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.createTable('subjects', {
        id: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        shortcode: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        first: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        last: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        email: {
          type: DataTypes.STRING(200),
          allowNull: true
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
      .then(() => { console.log('created subjects table'); })
      .catch((err) => { throw err; })

      await queryInterface.addIndex('subjects',
        {
          name: 'email',
          fields: ['email'],
        }
      )
      .then(() => { console.log('added email index'); })
      .catch((err) => { throw err; })

      await queryInterface.addIndex('subjects',
        {
          name: 'shortcode',
          fields: ['shortcode'],
        }
      )
      .then(() => { console.log('added shortcode index'); })
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
    return await queryInterface.dropTable('subjects');
  }
};
