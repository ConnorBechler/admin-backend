const { Service } = require('feathers-sequelize');

exports.ProcessingJobs = class ProcessingJobs extends Service {
  setup(app) {
    this.app = app;
  }
};
