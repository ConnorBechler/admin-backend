const ms = require('ms')
const { JWTStrategy } = require('@feathersjs/authentication')

module.exports = class CustomJWTStrategy extends JWTStrategy {
  async authenticate(authentication, params) {
    const config = this.authentication.configuration
    const { warnBefore, jwtOptions } = config

    const res = await super.authenticate(authentication, params)
    const curtime = new Date().getTime()
    const exp = res.authentication.payload.exp * 1000
    
    if (curtime + ms(warnBefore) > exp) {
      delete res.accessToken
    }

    return res
  }
}