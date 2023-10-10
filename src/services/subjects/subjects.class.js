const { Service } = require('feathers-sequelize');

exports.Subjects = class Subjects extends Service {
  setup(app) {
    this.app = app;
  }
};
