'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.createTable('dictionaryWords', {
        id: {
          type: DataTypes.STRING(36) + ' CHARSET utf8',
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        word: {
          type: DataTypes.STRING(255) + ' CHARSET utf8',
          allowNull: false,
        },
        phonemes: {
          type: DataTypes.TEXT('MEDIUM'),
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
      .then(() => { console.log('created dictionaryWords table'); })
      .catch((err) => { throw err; })

      await queryInterface.addIndex('dictionaryWords',
        {
          name: 'word',
          fields: ['word'],
        }
      )
      .then(() => { console.log('added word index'); })
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
    return await queryInterface.dropTable('dictionaryWords');
  }
};
