const { Service } = require('feathers-sequelize');

exports.Users = class Users extends Service {
  setup(app) {
    this.app = app;
  }
};
