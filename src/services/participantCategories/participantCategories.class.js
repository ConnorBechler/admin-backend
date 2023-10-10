const { Service } = require('feathers-sequelize');

exports.ParticipantCategories = class ParticipantCategories extends Service {
  setup(app) {
    this.app = app;
  }
};
