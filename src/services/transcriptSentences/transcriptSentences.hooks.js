const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const { isNotAdmin, lacksMatchingSubId, cancel } = require('../../hooks/helpers');

module.exports = {
  before: {
    all: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra,ga'), 
      iff(lacksMatchingSubId, cancel()))),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [
      // update transcription for validation purposes - flag as needing to be rechecked
      async hook => {
        const TranscriptService = hook.app.service('transcriptions');
        const transcript = await TranscriptService.get(hook.data.transcriptionId);
        if (transcript.id) {
          TranscriptService.patch(transcript.id, {
            metadata: {
              ...transcript.metadata,
              hasChanged: true,
            }
          });
        }
      },
    ],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
