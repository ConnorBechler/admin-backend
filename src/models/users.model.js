// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {
    id: {
      type: DataTypes.STRING(36) + ' CHARSET utf8',
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    first: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    last: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    roles: {
      type: DataTypes.JSON,
      defaultValue: ["user"],
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
      allowNull: false
    },
    hidden: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
      allowNull: false
    },
    isVerified: {
      type: DataTypes.TINYINT(1),
      allowNull: true
    },
    verifyToken: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    resetToken: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    verifyShortToken: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    resetShortToken: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    verifyExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }  
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  users.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return users;
};
