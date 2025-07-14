const { authenticate } = require('@feathersjs/authentication');
const { setField } = require('feathers-authentication-hooks');
const { iff, isProvider } = require('feathers-hooks-common');
const { shallowPopulate } = require('feathers-shallow-populate');
const { isNotAdmin, lacksMatchingDiaryID } = require('../../hooks/helpers');

const relations = {
  include: {
    service: 'profiles',
    nameAs: 'profile',
    keyHere: 'profileId',
    keyThere: 'id',
    asArray: false
  }
};

const restrict = setField({ from: 'params.user.id', as: 'params.query.id' });

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin('ra,ga'), 
      iff(lacksMatchingDiaryID, restrict))),
    ],
    get: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra,ga'), 
      iff(lacksMatchingDiaryID, restrict)))
    ],
    create: [
      iff(isProvider('external'), authenticate('jwt')),
      async (hook) => {
        const curSeq = await hook.app.service('diaries')
          .find({ query: {
            profileId: hook.data.profileId,
            'metadata.diaryDate': hook.data.metadata.diaryDate,
            $limit: 0}
          });
          hook.data.metadata = { ...hook.data.metadata, sequence: curSeq.total + 1 };
      },
    ],
    update: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), 
      iff(lacksMatchingDiaryID, restrict))),
    ],
    patch: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), 
      iff(lacksMatchingDiaryID, restrict))),
    ],
    remove: [
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin('ra, ga'), 
      iff(lacksMatchingDiaryID, restrict))),
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
