const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const { BadRequest, NotAuthenticated } = require('@feathersjs/errors');
const { isNotAdmin, cancel, checkForWorkerKey, checkWorkerKey, checkWorkerJobs, cleanupRemoteWorkerRequest } = require('../../hooks/helpers');

module.exports = {
  before: {
    all: [
      iff(isProvider('external'), iff(checkForWorkerKey, checkWorkerKey(), checkWorkerJobs())
        .else(authenticate('jwt'), iff(isNotAdmin('ra, ga'), cancel()))),
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
