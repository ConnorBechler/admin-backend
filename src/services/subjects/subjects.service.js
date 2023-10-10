// Initializes the `subjects` service on path `/subjects`
const { Subjects } = require('./subjects.class');
const createModel = require('../../models/subjects.model');
const hooks = require('./subjects.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/subjects', new Subjects(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('subjects');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants'),
      app.channel(`subjects/${data.id}`)
    ];
  })
};
