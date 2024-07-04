// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const processingJobs = sequelizeClient.define('processingJobs', {
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
      defaultValue: {},
      allowNull: true
    },
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  processingJobs.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return processingJobs;
};
