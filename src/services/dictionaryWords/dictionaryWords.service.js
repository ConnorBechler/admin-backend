// Initializes the `dictionaryWords` service on path `/dictionaryWords`
const { DictionaryWords } = require('./dictionaryWords.class');
const createModel = require('../../models/dictionaryWords.model');
const hooks = require('./dictionaryWords.hooks');
const download = require('./actions/download');

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
  app.use('/dictionaryWords', new DictionaryWords(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('dictionaryWords');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants')
    ];
  })

  app.use('/dictionary/download',
    {
      setup(app) {
        this.app = app;
      },
      async find(params) {
        const DictionaryService = app.service('dictionaryWords');
        const dict = await DictionaryService.find({ query: { $sort: { word: 1, phonemes: 1 } }, paginate:false })
        return dict;
      },
    },
    download
  );

};
