const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const { shallowPopulate } = require('feathers-shallow-populate');
const { isNotAdmin, cancel } = require('../../hooks/helpers');

const relations = {
  include: [
    {
      service: 'remoteWorkers',
      nameAs: 'remoteWorker',
      keyHere: 'remoteWorkerId',
      keyThere: 'id',
      asArray: false
    },
    {
      service: 'transcriptions',
      nameAs: 'transcription',
      keyHere: 'transcriptionId',
      keyThere: 'id',
      asArray: false
    }
  ]
};


const addExtraData = async (item, app) => {
  if (item.transcription && item.transcription.id) {
    const { parentId: diaryId } = await app.service('documents').get(item.transcription.documentId);
    if (diaryId) {
      const diary = await app.service('diaries').get(diaryId);
      if (diary && diary.id) {
        item.diaryData = diary.metadata;
        if (diary && diary.profile && diary.profile.subject) {
          item.shortcode = diary.profile.subject.shortcode ? diary.profile.subject.shortcode : false;
        }
      }
    }
  }
}

module.exports = {
  before: {
    all: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('researchManager'), cancel())),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ 
      shallowPopulate(relations),
      async (hook) => {
        if (hook.result && hook.result.total && hook.result.data && hook.result.data.length) {
          for (const pj of hook.result.data) {
            await addExtraData(pj, hook.app);
          }
        } else {
          await addExtraData(hook.result, hook.app);
        }
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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
