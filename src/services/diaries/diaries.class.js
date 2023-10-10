const { Service } = require('feathers-sequelize');

exports.Diaries = class Diaries extends Service {
  setup(app) {
    this.app = app;
  }
};
