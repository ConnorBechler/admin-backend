// Initializes the `configs` service on path `/configs`
const { Configs } = require('./configs.class');
const createModel = require('../../models/configs.model');
const hooks = require('./configs.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/configs', new Configs(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('configs');

  service.hooks(hooks);
};
