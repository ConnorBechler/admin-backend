// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const table = sequelizeClient.define('dictionaryWords', {
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
      defaultValue: {},
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
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  table.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return table;
};
