const { Service } = require('feathers-sequelize');

exports.Processing = class Processing extends Service {
  setup(app) {
    this.app = app;
  }
};
