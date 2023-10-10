// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const documents = sequelizeClient.define('documents', {
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
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      allowNull: true
    },
    visibility: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    },
    paranoid: false
  });

  // eslint-disable-next-line no-unused-vars
  documents.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return documents;
};
