const { Service } = require('feathers-sequelize');

exports.DiaryPayPeriods = class DiaryPayPeriods extends Service {
  setup(app) {
    this.app = app;
  }
};
