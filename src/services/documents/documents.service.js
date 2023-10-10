// Initializes the `documents` service on path `/documents`
const multer = require('multer');
const { v4 } = require('uuid');
const path = require('path')
const { NotFound, Forbidden } = require('@feathersjs/errors');
const { Documents } = require('./documents.class');
const createModel = require('../../models/documents.model');
const hooks = require('./documents.hooks');
const downloadHooks = require('./download.hooks');
const imageHooks = require('./image.hooks');
const { audio } = require('../converter/converter.service.js');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  // const events = ['status'];

  const options = {
    Model,
    paginate,
    // events
  };

  // TODO: move multer to s3 uploads/downloads

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, app.get('uploads')), // where the files are being stored
    filename: (_req, file, cb) => {
      cb(null, v4() + path.extname(file.originalname))
    }, // getting the file name
  });

  const upload = multer({storage}).array('files[]');

  // Initialize our service with any options it requires
  app.use('/documents',
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
    new Documents(options, app),
    (req, res, next) => {
      res.data.statusCode = res.statusCode;
      next();
    },
  );

  // Get our initialized service so that we can register hooks
  const service = app.service('documents');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants'),
      app.channel(`private/${data.id}`),
      app.channel(`private/${hook.data.profileId}`)
    ];
  });

  /* example of custom event - must include events array in setup above
  service.on('created', (data, hook) => {
    console.log('hook', hook.method);
    service.emit('status', {
      applicationId: data.applicationId,as
      type: 'status',
      text: 'yup'
    });
  });
  */

  app.use('/download',
    {
      async get(id, params) {
        const doc = await app.service('documents').get(id);
        if (doc.id) {
          return doc;
        }
      }
    },
    async (req, res, next) => {
      const resp = null;
      const result = res.hook.result
      if (req.method === 'GET' && result) {
        this.resp = app.get('uploads') + '/' + result.id + '.' + result.fileext;
      }
      const diary = await app.service('diaries').get(res.data.parentId);
      const sid = diary.profile.subject ? diary.profile.subject.shortcode : 'NOSID';
      const fileOutName = sid + '_' + (diary.metadata.diaryDate || new Date(new Date(diary.createdAt).getTime() - new Date(diary.createdAt).getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10)) + '_' + (diary.metadata.sequence.toString().padStart(2, 0) || '00') + '.' + result.fileext;
      res.setHeader('X-FileName', fileOutName);
      return res.download(this.resp, fileOutName);
    },
  );

  const downloadService = app.service('download');

  downloadService.hooks(downloadHooks);

  app.use('/images',
    {
      async get(id, params) {
        const doc = await app.service('documents').get(id);
        if (doc.id) {
          return doc;
        }
      }
    },
    (req, res, next) => {
      const resp = null;
      const result = res.hook.result
      if (req.method === 'GET' && result) {
        this.resp = app.get('uploads') + '/' + result.id + '.' + result.fileext;
      }
      res.setHeader("Content-Type", "image/" + result.fileext);
      res.setHeader("Content-Length", result.size);
      res.sendFile(this.resp);
    },
  );

  const imageService = app.service('images');

  imageService.hooks(imageHooks);

  app.use('/audio',
    {
      async get(id, params) {
        const doc = await app.service('documents').get(id);
        if (doc.id) {
          return doc;
        }
      }
    },
    audio
  );

  const audioService = app.service('audio');

  audioService.hooks(downloadHooks);
};
