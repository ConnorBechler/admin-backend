// Initializes the `transcriptSentences` service on path `/transcriptSentences`
const { TranscriptSentences } = require('./transcriptSentences.class');
const createModel = require('../../models/transcriptSentences.model');
const hooks = require('./transcriptSentences.hooks');
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
  app.use('/transcriptSentences', new TranscriptSentences(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('transcriptSentences');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants')
    ];
  })

};
