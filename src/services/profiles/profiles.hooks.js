const { authenticate } = require('@feathersjs/authentication');
const { setField } = require('feathers-authentication-hooks');
const { iff, isProvider } = require('feathers-hooks-common');
const { Forbidden } = require('@feathersjs/errors');
const { isNotAdmin } = require('../../hooks/helpers');
const { shallowPopulate } = require('feathers-shallow-populate');

const relations = {
  include: {
    service: 'subjects',
    nameAs: 'subject',
    keyHere: 'subjectId',
    keyThere: 'id',
    asArray: false
  }
};

const restrict = setField({ from: 'params.user.id', as: 'params.query.id' });

const checkKey = (hook) => {
    if (hook.data.secretKey !== process.env.FORM_SECRET) {
      throw new Forbidden('Fatal: no secret key sent');
    }
};

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), restrict)),
    ],
    get: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), restrict)),
    ],
    create: [
      iff(isProvider('rest'), checkKey),
    ],
    update: [
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), restrict)),
    ],
    patch: [
      iff(isProvider('rest'), checkKey),
    ],
    remove: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), restrict)),
    ]
  },

  after: {
    all: [
      shallowPopulate(relations),
    ],
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
