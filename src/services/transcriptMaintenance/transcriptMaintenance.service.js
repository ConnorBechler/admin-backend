const errors = require('@feathersjs/errors');
const hooks = require('./transcriptMaintenance.hooks');

const CheckForErrors = require('./actions/checkForErrors');

const options = {
  path: '/transcriptMaintenance',
};

// TODO: move calls inside cases to modules like authManagement

module.exports = function (app) {
  app.use('/transcriptMaintenance', {
    async create (data, params) {
      switch (data.action) {
        case 'checkForErrors':
          return await CheckForErrors(app, data);
          break;
        case 'options':
          return options;
        default:
          throw new errors.BadRequest(`Action '${data.action}' is invalid.`, {
            errors: { $className: 'badParams' }
          });
      }
    }
  });

  const service = app.service('transcriptMaintenance');
  service.hooks(hooks);
  
};

