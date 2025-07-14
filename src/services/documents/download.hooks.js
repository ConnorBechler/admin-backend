const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider, discard, disallow, preventChanges } = require('feathers-hooks-common');
const { Forbidden } = require('@feathersjs/errors');
const { setField } = require('feathers-authentication-hooks');
const fs = require('fs');
const { isNotAdmin, lacksMatchingDiaryID, cancel, checkForWorkerKey, checkWorkerKey, cleanupRemoteWorkerRequest } = require('../../hooks/helpers');

module.exports = {
  before: {
    all: [
      iff(isProvider('external'), iff(checkForWorkerKey, checkWorkerKey(), cleanupRemoteWorkerRequest())
        .else(authenticate('jwt'), iff(isNotAdmin('ra,ga'), 
        iff(lacksMatchingDiaryID, cancel())))),
    ],
    find: [],
    get: [
    ],
    create: [
    ],
    update: [
    ],
    patch: [
    ],
    remove: [
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
    ],
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
