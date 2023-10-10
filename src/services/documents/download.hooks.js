const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider, discard, disallow, preventChanges } = require('feathers-hooks-common');
const { Forbidden } = require('@feathersjs/errors');
const { setField } = require('feathers-authentication-hooks');
const fs = require('fs');
const { isNotAdmin, cancel } = require('../../hooks/helpers');

module.exports = {
  before: {
    all: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), cancel())),
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
