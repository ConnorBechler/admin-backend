// Initializes the `authmanagement` service on path `/authmanagement`
const authManagement = require('authentication-local-management-v4');
const hooks = require('./authmanagement.hooks');
const notifier = require('../mailer/notifier');

module.exports = function (app) {

  // Initialize our service with any options it requires
  app.configure(authManagement(notifier(app)));

  // Get our initialized service so that we can register hooks
  const service = app.service('authManagement');

  service.hooks(hooks);

  service.on('ATTEMPTED_BAD_RESET', (data) => {
    // TODO: db log bad resets?
    console.log('non-existent email attempted to be reset:', data)}
  );
};
