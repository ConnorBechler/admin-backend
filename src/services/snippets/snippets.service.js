// Initializes the `snippets` service on path `/snippets`
const multer = require('multer');
const { v4 } = require('uuid');
const path = require('path')
const { parseAsync, Parser } = require('json2csv');
const { Snippets } = require('./snippets.class');
const createModel = require('../../models/snippets.model');
const hooks = require('./snippets.hooks');
const { text } = require('../converter/converter.service.js');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, app.get('uploads')), // where the files are being stored
    filename: (_req, file, cb) => {
      cb(null, v4() + path.extname(file.originalname))
    }, // getting the file name
  });

  const upload = multer({storage}).array('files[]');

  // Initialize our service with any options it requires
  app.use('/snippets', new Snippets(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('snippets');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants')
    ];
  })

  app.use('/snippets/:id/download',
    {
      async find(params) {
        const snippet = await app.service('snippets').get(params.route.id);
        if (snippet.id) {
          return snippet;
        }
      }
    },
    async (req, res, next) => {
      const resp = null;
      const result = res.hook.result;
      if (req.method === 'GET') {
        const docs = await app.service('documents').find({ query: { parentId: result.id } });
        const doc = docs.data[0];
        if (doc.id) {
          this.resp = app.get('uploads') + '/' + doc.id + '.' + doc.fileext;
          const diary = await app.service('diaries').get(result.diaryId);
          const sid = diary.profile.subject ? diary.profile.subject.shortcode : 'NOSID';
          const snippetSequence = (result.metadata.sequence) ? result.metadata.sequence.toString().padStart(2,0) : '00';
          const fileOutName = sid + '_' + (diary.metadata.diaryDate || new Date(new Date(diary.createdAt).getTime() - new Date(diary.createdAt).getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10)) + '_' + (diary.metadata.sequence.toString().padStart(2, 0) || '00') + '-snippet_' + snippetSequence + '.' + doc.fileext;
          res.setHeader('X-FileName', fileOutName);
          return res.download(this.resp, fileOutName);
        }
      }
    },
  );

  app.use('/snippets/:id/upload',
    (req, res, next) => {
      if (req.method === 'POST') {
        return upload(req, res, next);
      }
      next();
    },
    (req, res, next) => {
      if (req.method === 'POST') {
        if (req.files) {
          req.feathers.files = req.files;
        }
      }
      next();
    },
    {
      async create(data, params) {
        let ret = {};
        params.provider = 'server';
        if (data.parentId && params.files) {
          ret = await app.service('documents').create(data, params);
        }
        return ret;
      }
    },
    (req, res, next) => {
      res.data.statusCode = res.statusCode;
      next();
    },
  );

  app.use('/snippets/:id/copyfrom/:transcriptid',
    {
      async create(data, params) {
        const snippet = await app.service('snippets').get(params.route.id);
        const transcript = await app.service('transcriptions').get(params.route.transcriptid);
        if (snippet.id && transcript.id) {
          return {
            snippet,
            transcript
          };
        }
      }
    },
    async (req, res, next) => {
      const options = {
        delimiter: '\t',
        quote: '',
        header: false,
        fields: [ 
          {
            label: '-- transcript --',
            value: 'content'
          }
        ],
      }
      const { snippet, transcript } = res.hook.result;
      const { data: sentences } = await res.app.service('transcriptSentences').find({ query: { transcriptionId: transcript.id }});
      const tsvParser = new Parser(options);
      const tsv = tsvParser.parse(sentences);
      return await app.service('snippets').patch(snippet.id, { content: tsv });
    },
    (req, res, next) => {
      res.data.statusCode = res.statusCode;
      next();
    },
  );

};
