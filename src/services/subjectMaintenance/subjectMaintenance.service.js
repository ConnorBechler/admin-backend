const errors = require('@feathersjs/errors');
const hooks = require('./subjectMaintenance.hooks');
const notifier = require('../mailer/notifier');
const { isNotAdmin } = require('../../hooks/helpers');
const Signup = require('./actions/signup');

const options = {
  path: '/subjectMaintenance',
  notifier: async () => { },
};

module.exports = function (app) {
  app.use('/subjectMaintenance', {
    async create (data, params) {
      switch (data.action) {
        case 'signup':
          return await Signup(app, data);
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

  const service = app.service('subjectMaintenance');
  service.hooks(hooks);
  
};

