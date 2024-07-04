const errors = require('@feathersjs/errors');
const hooks = require('./transcriptionManager.hooks');
const TranscriptionsList = require('./actions/transcriptionsList');

const options = {
  path: '/transcriptionManager',
};

// TODO: move calls inside cases to modules like authManagement

module.exports = function (app) {
  app.use('/transcriptionManager', {
    async create (data, params) {
      switch (data.action) {
          case 'list':
            return await TranscriptionsList(app, data, params);
            break;
        case 'options':
          return options;
        default:
          throw new errors.BadRequest(`Action '${data.action}' is invalid.`, {
            errors: { $className: 'badParams' }
          });
      }
    },
  });

  const service = app.service('transcriptionManager');
  service.hooks(hooks);
  
};

