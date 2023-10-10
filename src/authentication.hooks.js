const { checkContext } = require('feathers-hooks-common');
const decode = require('jwt-decode');
const { BadRequest } = require('@feathersjs/errors');

function addTTL() {
  return async context => {
    checkContext(context, 'after', ['create', 'update', 'patch'], 'jwtAuthentication')
    const curtime = new Date().getTime()
    if (context.path === 'auth' && context.result && context.result.accessToken) {
      const detok = decode(context.result.accessToken)
      const toktime = detok.exp * 1000
      context.result.ttl = toktime-curtime
    }
  }
}

function cleanup() {
  return async context => {
    delete context.result.user.active;
    delete context.result.user.hidden;
    delete context.result.user.createdAt;
    delete context.result.user.updatedAt;
    delete context.result.user.deletedAt;
  }
}

function checkDisabled() {
  return async context => {
    if (context.result.user && !context.result.user.active) {
      throw new BadRequest('Login Error: Your User has been deactivated');
    }
  }
}

module.exports = {
  before: {
    all: [],
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
    create: [
      checkDisabled(),
      addTTL(),
      cleanup(),
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      context => {
        if (context.error) {
          const error = context.error;
          if (error.data && error.data.name === 'TokenExpiredError') {
            error.message = 'Your session has expired - please login again';
          }
        }
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
