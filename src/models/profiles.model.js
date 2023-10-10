// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const profiles = sequelizeClient.define('profiles', {
    id: {
      type: DataTypes.STRING(36) + ' CHARSET utf8',
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    fname: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    lname: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    subjectId: {
      type: DataTypes.STRING(36) + ' CHARSET utf8',
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      allowNull: true
    },
    active: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      allowNull: false
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
  profiles.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return profiles;
};
