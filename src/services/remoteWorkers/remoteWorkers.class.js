const { Service } = require('feathers-sequelize');

exports.RemoteWorkers = class RemoteWorkers extends Service {
  setup(app) {
    this.app = app;
  }
};
