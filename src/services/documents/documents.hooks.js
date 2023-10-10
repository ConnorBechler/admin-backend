const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const { Forbidden } = require('@feathersjs/errors');
const fs = require('fs');
const TranscriberService = require('../transcriber/transcriber.service.js');
const { getMetadata, saveStreamCopy, saveWavCopy } = require('../converter/converter.service.js');
const { isNotAdmin, cancel } = require('../../hooks/helpers');

const checkKey = (hook) => {
    if (hook.data.secretKey !== process.env.FORM_SECRET) {
      throw new Forbidden('Fatal: no secret key sent');
    }
};

const fileTypes = [
  "m4a",
  "mp4",
  "webm",
  "wav",
  "ogg",
  "flac",
  "mp3",
];

module.exports = {
  before: {
    all: [
    ],
    find: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), cancel())),
    ],
    get: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), cancel())),
    ],
    create: [
      iff(isProvider('rest'), checkKey)
        .else(authenticate('jwt'), iff(isNotAdmin('ra, ga'), cancel())),
    ],
    update: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), cancel())),
    ],
    patch: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), cancel())),
    ],
    remove: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), cancel())),
    ]
  },

  after: {
    all: [
    ],
    find: [
    ],
    get: [
    ],
    create: [
      async hook => {
        if (hook.params && hook.params.files) {
          hook.params.files.forEach(async uploadedFile => {
            const docId = uploadedFile.filename.split('.')[0];
            const ext = uploadedFile.filename.split('.')[1];
            if (!hook.data.parentId && fileTypes.some(fileType => ext.includes(fileType))) {
              await saveWavCopy(hook.app, hook.app.get('uploads'), docId, uploadedFile.filename)
                .then(() => {
                  TranscriberService(hook.app, docId)
                    .catch(async err => {console.log('TranscriberService error:', err)});
                })
                .catch(async err => {console.log('saveWavCopy error:', err)});
              console.log('kicked off transcription for', docId);
            }
            if (fileTypes.some(fileType => ext.includes(fileType))) {
              getMetadata(hook.app, docId, (hook.data.parentId) ? 'snippets' : 'diaries')
                .catch(async err => { console.log('ffmpeg error:', err)});
              console.log('kicked off metadata gen for', docId);
              saveStreamCopy(hook.app, docId)
                .catch(async err => { console.log('ffmpeg error:', err)});
              console.log('kicked off stream copy for', docId);
            }
          });
        }
      }
    ],
    update: [],
    patch: [],
    remove: [
      hook => {
        fs.unlink(hook.app.get('uploads') + '/' + hook.result.id + '.' + hook.result.fileext, () => {});
      },
    ]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => {
        if (hook.params.files) {
          hook.params.files.forEach(file => {
            fs.unlink(hook.app.get('uploads') + '/' + file.filename, () => {});
          });
        }
      },
    ],
    update: [],
    patch: [],
    remove: []
  }
};
