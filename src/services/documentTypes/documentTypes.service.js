// Initializes the `documentTypes` service on path `/documentTypes`
const { DocumentTypes } = require('./documentTypes.class');
const createModel = require('../../models/documentTypes.model');
const hooks = require('./documentTypes.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  // const events = ['status'];

  const options = {
    Model,
    paginate,
    // events
  };

  // Initialize our service with any options it requires
  app.use('/documentTypes', new DocumentTypes(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('documentTypes');

  service.hooks(hooks);

  /* example of custom event - must include events array in setup above
  service.on('created', (data, hook) => {
    console.log('hook', hook.method);
    service.emit('status', {
      applicationId: data.applicationId,
      type: 'status',
      text: 'yup'
    });
  });
  */
};
