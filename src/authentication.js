const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth } = require('@feathersjs/authentication-oauth');
const customJWTStrategy = require('./customJWTStrategy');
const hooks = require('./authentication.hooks');

module.exports = app => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new customJWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/auth', authentication);
  app.configure(expressOauth());

  const service = app.service('auth');

  service.hooks(hooks);


};
