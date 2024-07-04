// Initializes the `processingJobs` service on path `/processingJobs`
const { ProcessingJobs } = require('./processingJobs.class');
const createModel = require('../../models/processingJobs.model');
const hooks = require('./processingJobs.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate: {
      ... paginate,
      default: 9999,
    },
  };

  // Initialize our service with any options it requires
  app.use('/processingJobs', new ProcessingJobs(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('processingJobs');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('research')
    ];
  })

};
