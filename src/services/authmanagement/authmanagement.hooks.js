const { authenticate } = require('@feathersjs/authentication');
const { iff } = require('feathers-hooks-common');
const { BadRequest } = require('@feathersjs/errors');

const isAction = (...args) => hook => args.includes(hook.data.action);

function checkMatching() {
  return async hook => {
    if (hook.params && hook.data && (hook.params.user.email !== hook.data.value.user.email)) {
      throw new BadRequest('Authenticated User does not match User to be changed');
    }
  }
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(isAction('passwordChange', 'identityChange'), authenticate('jwt'), checkMatching()),
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(isAction('sendResetPwd'), 
        (context) => {
          context.result = {};
        })
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(isAction('sendResetPwd'), 
        (context) => {
          if (context.error.code === 400 && context.error.message === 'User not found.') {
            context.app.service('authManagement').emit('ATTEMPTED_BAD_RESET', context.data.value.email);
          }
          delete context.error;
          context.result = {};
        })
    ],
    update: [],
    patch: [],
    remove: []
  }
};
