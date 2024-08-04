const { authenticate } = require('@feathersjs/authentication');
const { setField } = require('feathers-authentication-hooks');
const { iff, isProvider } = require('feathers-hooks-common');
const { Forbidden } = require('@feathersjs/errors');
const { isNotAdmin, cancel, assignNextSID } = require('../../hooks/helpers');

module.exports = {
  before: {
    all: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), cancel)),
    ],
    find: [],
    get: [],
    create: [
      iff(hook => !hook.data.shortcode && hook.data.assignSID, assignNextSID),
      (hook) => {
        hook.data.metadata = hook.data.metadata
          ? hook.data.metadata
          : {};
        hook.data.metadata.coded = (hook.data.metadata && hook.data.metadata.coded)
          ? hook.data.metadata.coded
          : {};
        hook.data.metadata.coded.birthYear = hook.data.metadata.dateOfBirth ? hook.data.metadata.dateOfBirth.substr(0, 4) : null;
        hook.data.metadata.coded.gender = hook.data.metadata.gender || null;
        hook.data.metadata.coded.ethnicityNotes = hook.data.metadata.ethnicity || null;
      },
    ],
    update: [
      iff(hook => !hook.data.shortcode && hook.data.assignSID, assignNextSID),
    ],
    patch: [
      iff(hook => !hook.data.shortcode && hook.data.assignSID, assignNextSID),
    ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => hook.result.assignSID = false,
    ],
    update: [
      hook => hook.result.assignSID = false,
    ],
    patch: [
      hook => hook.result.assignSID = false,
    ],
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
