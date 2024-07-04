const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const { BadRequest } = require('@feathersjs/errors');
const { isNotAdmin, cancel, checkForWorkerKey, checkWorkerKey, cleanupRemoteWorkerRequest } = require('../../hooks/helpers');


function checkUnique() {
  return async hook => {
    await hook.app.service('dictionaryWords').find( { query: {
      word: hook.data.word,
      phonemes: hook.data.phonemes,
    }})
    .then((resp) => {
      if (resp && resp.data) {
        if (resp.data.filter(r => r.id !== hook.data.id).length !== 0) {
          throw new BadRequest('Word with these exact phonemes already added!');
        }
      }
    })
    .catch((err) => {
      throw err;
    })
  }
}

module.exports = {
  before: {
    all: [
      iff(isProvider('external'), iff(checkForWorkerKey, checkWorkerKey(), cleanupRemoteWorkerRequest())
        .else(authenticate('jwt'), iff(isNotAdmin('ra,ga'), cancel()))),
    ],
    find: [],
    get: [],
    create: [
      checkUnique(),
    ],
    update: [
      checkUnique(),
    ],
    patch: [
      checkUnique(),
    ],
    remove: []
  },

  after: {
    all: [],
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
