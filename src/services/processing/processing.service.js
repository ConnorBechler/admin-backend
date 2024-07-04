const errors = require('@feathersjs/errors');
const { parseAsync, Parser } = require('json2csv');
const hooks = require('./processing.hooks');
const notifier = require('../mailer/notifier');
const { isNotAdmin } = require('../../hooks/helpers');
const CheckForWork = require('./actions/checkForWork');
const UpdateWork = require('./actions/updateWork');

const options = {
  path: '/processing',
  notifier: async () => { },
};

// TODO: move calls inside cases to modules like authManagement
// TODO: mailer integrations in cases/modules

module.exports = function (app) {
  app.use('/processing',
    {
      async create (data, params) {
        switch (data.action) {
          case 'checkForWork':
            return await CheckForWork(app, data, params);
            break;
          case 'updateWork':
            return await UpdateWork(app, data, params);
            break;
          case 'options':
            return options;
          default:
            throw new errors.BadRequest(`Action '${data.action}' is invalid.`, {
              errors: { $className: 'badParams' }
            });
        }
      },
    },
  );

  const processingService = app.service('/processing');
  processingService.hooks(hooks);
  
};
