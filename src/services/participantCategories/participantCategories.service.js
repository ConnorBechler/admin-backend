// Initializes the `participantCategories` service on path `/participantCategories`
const { ParticipantCategories } = require('./participantCategories.class');
const createModel = require('../../models/participantCategories.model');
const hooks = require('./participantCategories.hooks');
const { text } = require('../converter/converter.service.js');

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
  app.use('/participantCategories', new ParticipantCategories(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('participantCategories');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants')
    ];
  })

};
