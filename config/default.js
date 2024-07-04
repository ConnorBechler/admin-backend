module.exports = {
  'host': 'localhost',
  'port': process.env.PORT,
  'public': '../public/',
  'uploads': process.env.STORAGE_PATH,
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
      'audience': process.env.JWT_AUDIENCE,
      'issuer': process.env.JWT_ISSUER,
      'algorithm': 'HS512',
      'expiresIn': '8h'
    },
    'local': {
      'usernameField': 'email',
      'passwordField': 'password'
    }
  }
};
