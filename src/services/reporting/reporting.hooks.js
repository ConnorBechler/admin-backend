const { authenticate } = require('@feathersjs/authentication');
const { iff, isProvider } = require('feathers-hooks-common');
const { isNotAdmin, cancel } = require('../../hooks/helpers');


module.exports = {
  before: {
    all: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), cancel())),],
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
