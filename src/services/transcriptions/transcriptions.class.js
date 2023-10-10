const { Service } = require('feathers-sequelize');

exports.Transcriptions = class Transcriptions extends Service {
  setup(app) {
    this.app = app;
  }
};
