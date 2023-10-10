const { authenticate } = require('@feathersjs/authentication');
const { setField } = require('feathers-authentication-hooks');
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const { iff, isProvider, discard, preventChanges } = require('feathers-hooks-common');
const verifyHooks = require('authentication-local-management-v4').hooks;
const axios = require('axios');
const querystring = require('querystring');
// const addAssociations = require('../../hooks/add-associations');
const mailer = require('../mailer/notifier');
const { BadRequest } = require('@feathersjs/errors');
const { isNotAdmin } = require('../../hooks/helpers');

const restrict = setField({ from: 'params.user.id', as: 'params.query.id' });

const blockChanges = preventChanges(false,
  'active', 'hidden', 'id', 'roles',
  'email',
  'isVerified',
  'verifyToken', 'verifyShortToken', 'verifyExpires',
  'verifyChanges',
  'resetToken', 'resetShortToken', 'resetExpires'
  );

const removeReturns = discard(
  'verifyToken', 'verifyShortToken',
  'verifyChanges',
  'resetToken', 'resetShortToken');


function checkUnique() {
  return async hook => {
    await hook.app.service('authManagement').create(
      {
        action: 'checkUnique',
        value: { email: hook.data.email }
      }
    )
    .then(() => {})
    .catch((err) => {
      throw new BadRequest('User already exists');
    })
  }
};

function validateRecaptcha() {
  return async hook => {
    await axios
      .post('https://www.google.com/recaptcha/api/siteverify', 
        querystring.stringify({
          secret: process.env.RECAPTCHA_SECRET,
          response: hook.arguments[0].recaptchaToken
        })
      )
      .then((resp) => {
        if (!resp.data.success) {
          throw new BadRequest('Could not validate captcha.');
        }
      })
  }
};

module.exports = {
  before: {
    all: [],
    find: [ 
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), restrict)),
    ],
    get: [ 
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), restrict)),
    ],
    create: [
      checkUnique(),
      // two below = temporary until signup live
      iff(isProvider('external'), authenticate('jwt')),
      iff(isProvider('external'), iff(isNotAdmin(), validateRecaptcha())),
      // remove comment below when signup live
      //validateRecaptcha(),
      hashPassword('password'),
      iff(isProvider('external'), iff(isNotAdmin(), discard('roles'))),
      (hook) => {
        if (hook.params.user && (hook.params.user.roles.includes('admin') || hook.params.user.roles.includes('super'))) {
          hook.data.isVerified = true;
        }
      },
      iff(isProvider('external'), iff(isNotAdmin(), verifyHooks.addVerification())),
    ],
    update: [ 
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), restrict, blockChanges)),
      hashPassword('password'),
    ],
    patch: [ 
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), restrict, blockChanges)),
      iff(isProvider('external'), hashPassword('password')),
    ],
    remove: [ 
      authenticate('jwt'),
      iff(isProvider('external'), iff(isNotAdmin(), restrict)),
    ]
  },

  after: {
    all: [ 
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [
      iff(isProvider('external'), removeReturns)
    ],
    get: [
      iff(isProvider('external'), removeReturns)
    ],
    create: [
      (context) => {
        (context.result.isVerified)
          ? mailer(context.app).notifier('sendAdminCreated', context.result)
          : mailer(context.app).notifier('resendVerifySignup', context.result)
      },
      iff(isProvider('external'), removeReturns),
      verifyHooks.removeVerification(),
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
