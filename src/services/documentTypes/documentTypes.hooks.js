const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const { isNotAdmin, cancel } = require('../../hooks/helpers');

module.exports = {
  before: {
    all: [],
    find: [
    ],
    get: [
    ],
    create: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), cancel())),
    ],
    update: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), cancel())),
    ],
    patch: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), cancel())),
    ],
    remove: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), cancel())),
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
