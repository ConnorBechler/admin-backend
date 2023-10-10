const errors = require('@feathersjs/errors');
const hooks = require('./adminMaintenance.hooks');
const notifier = require('../mailer/notifier');
const { isNotAdmin } = require('../../hooks/helpers');

const FixMetadata = require('./actions/fixMetadata');
const RequestNewTranscript = require('./actions/requestNewTranscript');
const CheckUniqueSID = require('./actions/checkUniqueSID');

const options = {
  path: '/adminMaintenance',
  notifier: async () => { },
};

// TODO: move calls inside cases to modules like authManagement

module.exports = function (app) {
  app.use('/adminMaintenance', {
    async create (data, params) {
      switch (data.action) {
        case 'diary:fixMetadata':
          return await FixMetadata(app, data);
          break;
        case 'diary:requestNewTranscript':
          return await RequestNewTranscript(app, data);
          break;
        case 'profile:checkUniqueSID':
          return await CheckUniqueSID(app, data);
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

  const service = app.service('adminMaintenance');
  service.hooks(hooks);
  
};

