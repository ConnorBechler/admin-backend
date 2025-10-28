const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider  } = require('feathers-hooks-common');
const { isNotAdmin, lacksMatchingSubId, cancel, checkForWorkerKey, checkWorkerKey, cleanupRemoteWorkerRequest } = require('../../hooks/helpers');

module.exports = {
  before: {
    all: [
      iff(isProvider('external'), iff(checkForWorkerKey, checkWorkerKey(), cleanupRemoteWorkerRequest())
        .else(authenticate('jwt'), iff(isNotAdmin('ra,ga'), 
        iff(lacksMatchingSubId, cancel())))),
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
