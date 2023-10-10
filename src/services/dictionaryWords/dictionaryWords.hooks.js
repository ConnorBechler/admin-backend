const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const { BadRequest } = require('@feathersjs/errors');
const { isNotAdmin, cancel } = require('../../hooks/helpers');


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
    all: [],
    find: [],
    get: [],
    create: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra,ga'), cancel())),
      checkUnique(),
    ],
    update: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra,ga'), cancel())),
      checkUnique(),
    ],
    patch: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra,ga'), cancel())),
      checkUnique(),
    ],
    remove: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra,ga'), cancel())),
    ]
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
