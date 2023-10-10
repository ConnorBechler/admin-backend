// Initializes the `diaries` service on path `/diaries`
const { Diaries } = require('./diaries.class');
const createModel = require('../../models/diaries.model');
const hooks = require('./diaries.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/diaries', new Diaries(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('diaries');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants'),
      app.channel(`private/${data.profileId}`)
    ];
  })
};
