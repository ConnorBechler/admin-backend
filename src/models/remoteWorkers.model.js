// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const remoteWorkers = sequelizeClient.define('remoteWorkers', {
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
      defaultValue: {},
      allowNull: true
    },
    enabled: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
    hidden: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
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
  remoteWorkers.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return remoteWorkers;
};
