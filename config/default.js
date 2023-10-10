module.exports = {
  'host': 'localhost',
  'port': process.env.PORT,
  'public': '../public/',
  'uploads': '../../storage',
  'paginate': {
    'default': 25,
    'max': 99999
  },
  'authentication': {
    'secret': process.env.SECRET,
    'authStrategies': [
      'jwt',
      'local'
    ],
    'path': '/auth',
    'entity': 'user',
    'service': 'users',
    'warnBefore': '15m',
    'jwtOptions': {
      'header': {
        'typ': 'bearer'
      },
      'audience': 'app.midiaries.org',
      'issuer': 'app.midiaries',
      'algorithm': 'HS512',
      'expiresIn': '8h'
    },
    'local': {
      'usernameField': 'email',
      'passwordField': 'password'
    }
  }
};
