// Initializes the `dictionaryWords` service on path `/dictionaryWords`
const { DictionaryWords } = require('./dictionaryWords.class');
const createModel = require('../../models/dictionaryWords.model');
const hooks = require('./dictionaryWords.hooks');
const download = require('./actions/download');
const { parseAsync } = require('json2csv');
const fs = require('fs').promises;
const { correctedDateTime } = require('../../hooks/helpers');


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
        const ConfigService = app.service('configs');
        const fsDestination = app.get('uploads');
        const fsFilename = `${process.env.SUBJECT_PREFIX}_latest_dict.txt`;
        const processedAt = new Date();
        params.query.fromApp = params.query.fromApp == 'true';

        const [ latestDictionary ] = await ConfigService.find({ query: { name: 'latestDictionary' }, paginate: false});
        const [{ updatedAt: lastUpdate }] = await DictionaryService.find({ query: { $sort: { updatedAt: -1 }, $limit: 1 }, paginate: false });

        if (lastUpdate.getTime() >= new Date(latestDictionary[latestDictionary.field]).getTime()) {
          const options = {
            header: false,
            fields: [
              {
                label: 'word',
                value: 'word'
              },
              {
                label: 'phonemes',
                value: 'phonemes'
              },
            ],
            delimiter: '  ',
            quote: '',
            eol: ' \n',
          };
          const dict = await DictionaryService.find({ query: { $sort: { word: 1, phonemes: 1 } }, paginate:false })
          const filename = params.query.fromApp
            ? `${process.env.SUBJECT_PREFIX}_${correctedDateTime(processedAt).toISOString().substr(0, 10)}_dict.txt`
            : `${process.env.SUBJECT_PREFIX}_${processedAt.getTime()}.dict`

          try {
            const ret = await parseAsync(dict, options);
            await fs.writeFile(`${fsDestination}/${fsFilename}`, ret, 'utf8');
            await ConfigService.patch(latestDictionary.id, { value: `${processedAt.toISOString()}`});
            console.log(`${new Date().getTime()}: wrote new dict file to ${fsDestination}/${fsFilename}`);
            return {
              fileContents: ret,
              filename,
            };
          }
          catch (err) {
            console.log(err)
          }
        } else {
          const filename = params.query.fromApp
            ? `${process.env.SUBJECT_PREFIX}_${correctedDateTime(latestDictionary[latestDictionary.field]).toISOString().substr(0, 10)}_dict.txt`
            : `${process.env.SUBJECT_PREFIX}_${new Date(latestDictionary[latestDictionary.field]).getTime()}.dict`
          return {
            file: `${fsDestination}/${fsFilename}`,
            filename,
          };
        }
      }
    },
    download
  );

  const dictionaryDownloadService = app.service('/dictionary/download');

  dictionaryDownloadService.hooks(hooks);

};
