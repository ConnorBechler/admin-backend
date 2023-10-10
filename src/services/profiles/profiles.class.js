const { Service } = require('feathers-sequelize');

exports.Profiles = class Profiles extends Service {
  setup(app) {
    this.app = app;
  }
};
