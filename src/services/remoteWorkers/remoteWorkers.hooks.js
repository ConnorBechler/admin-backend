const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const { isNotAdmin, cancel } = require('../../hooks/helpers');
const crypto = require('crypto');

module.exports = {
  before: {
    all: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('researchManager'), cancel())),
    ],
    find: [],
    get: [],
    create: [
      (hook) => {
        hook.data.secret = hook.data.secret ? hook.data.secret : crypto.randomBytes(32).toString('hex');
      },
    ],
    update: [
      (hook) => {
        hook.data.secret = hook.data.secret ? hook.data.secret : crypto.randomBytes(32).toString('hex');
      },
    ],
    patch: [
      (hook) => {
        hook.data.secret = hook.data.secret ? hook.data.secret : crypto.randomBytes(32).toString('hex');
      },
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
