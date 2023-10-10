// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const transcriptions = sequelizeClient.define('transcriptions', {
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
      defaultValue: [],
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      allowNull: true
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
  transcriptions.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return transcriptions;
};
