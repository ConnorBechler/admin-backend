const { authenticate } = require('@feathersjs/authentication');
const { iff } = require('feathers-hooks-common');
const { isNotAdmin, cancel } = require('../../hooks/helpers');


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      authenticate('jwt'),
      iff(isNotAdmin('ra, ga'), cancel()),
    ],
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
