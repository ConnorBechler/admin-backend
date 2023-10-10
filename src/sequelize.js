const Sequelize = require('sequelize');
const sequelizeConfig = require('../db/config');

module.exports = function (app) {
  const sequelize = new Sequelize(sequelizeConfig);
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        models[name].associate(models);
      }
    });

    // Sync to the database
    // app.set('sequelizeSync', sequelize.sync());

    return result;
  };
};
