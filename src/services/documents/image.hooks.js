const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const fs = require('fs');
const { isNotAdmin, cancel } = require('../../hooks/helpers');

module.exports = {
  before: {
    all: [
      /* TODO: we'll deal with auth for image loading later; near-zero ability crawl anyways
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), cancel())),
      */
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
