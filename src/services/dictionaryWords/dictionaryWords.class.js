const { Service } = require('feathers-sequelize');

exports.DictionaryWords = class DictionaryWords extends Service {
  setup(app) {
    this.app = app;
  }
};
