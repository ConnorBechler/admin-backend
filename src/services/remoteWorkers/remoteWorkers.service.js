// Initializes the `remoteWorkers` service on path `/remoteWorkers`
const { RemoteWorkers } = require('./remoteWorkers.class');
const createModel = require('../../models/remoteWorkers.model');
const hooks = require('./remoteWorkers.hooks');

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
  app.use('/remoteWorkers', new RemoteWorkers(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('remoteWorkers');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('research')
    ];
  })

};
