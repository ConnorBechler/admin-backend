const { Service } = require('feathers-sequelize');

exports.Snippets = class Snippets extends Service {
  setup(app) {
    this.app = app;
  }
};
