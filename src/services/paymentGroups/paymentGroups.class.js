const { Service } = require('feathers-sequelize');

exports.PaymentGroups = class PaymentGroups extends Service {
  setup(app) {
    this.app = app;
  }
};
