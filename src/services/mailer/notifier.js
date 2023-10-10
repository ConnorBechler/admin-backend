const pug = require('pug');

module.exports = function(app) {

  function getHost() {
    const host = process.env.APP_BASE;
    return host;
  }

  function getLink(path, hash) {
    const host = getHost();
    const url = host + path + '?token=' + hash
    return url
  }

  function sendEmail(email) {
    return app.service('mailer').create(email).then(function (result) {
      console.log('Sent email', result)
    }).catch(err => {
      console.log('Error sending email', err)
    })
  }

  function compiledText(template, locals) {
    const prep = pug.compileFile(__dirname + '/emails/' + template + '.pug')
    return prep(locals);
  }

  return {
    notifier: async function(type, obj, notifierOptions) {
      let tokenLink
      let email
      switch (type) {
        /*
        case 'applicationDetails':
          const prog = await app.service('programs').get(user.programid)
          email = {
             from: process.env.FROM_EMAIL,
             to: user.primaryemail,
             subject: 'ELC Application details',
             html: compiledText('startedNewApplication', {
                firstname: user.firstname,
                link: getHost() + 'continue',
                programname: prog.programname,
                shortcode: user.shortcode,
                pin: user.pin
              })
          }

          return sendEmail(email)
          break
        */
        
        case 'sendResetPwd': //sending the user the verification email
          email = {
             from: process.env.FROM_EMAIL,
             to: obj.email,
             subject: `${process.env.APP_NAME} - Password Reset Request`,
             html: compiledText('resetUserPassword', {
                prefix: process.env.SUBJECT_PREFIX,
                appName: process.env.APP_NAME,
                link: getLink('login/reset', obj.resetToken)
              })
          }
          return sendEmail(email)
          break
        
        case 'sendAdminCreated': //sending the user the verification email
          email = {
             from: process.env.FROM_EMAIL,
             to: obj.email,
             subject: `${process.env.APP_NAME} - Account Created`,
             html: compiledText('adminCreatedUser', {
                prefix: process.env.SUBJECT_PREFIX,
                appName: process.env.APP_NAME,
                link: getLink('login/forgot', obj.email)
              })
          }
          return sendEmail(email)
          break
        
        case 'resendVerifySignup': //sending the user the verification email
          email = {
             from: process.env.FROM_EMAIL,
             to: obj.email,
             subject: `${process.env.APP_NAME} - Verify Signup`,
             html: compiledText('verifyUserSignup', {
                prefix: process.env.SUBJECT_PREFIX,
                appName: process.env.APP_NAME,
                link: getLink('login/verify', obj.verifyToken)
              })
          }
          return sendEmail(email)
          break

        case 'verifySignup': // confirming verification
          email = {
             from: process.env.FROM_EMAIL,
             to: obj.email,
             subject: `${process.env.APP_NAME} - Verified`,
             html: compiledText('confirmVerification', {
              prefix: process.env.SUBJECT_PREFIX,
              appName: process.env.APP_NAME,
            })
          }
          return sendEmail(email)
          break

        case 'sendNoticeToAdminSignup': // notify admins of new subject
          email = {
            from: process.env.FROM_EMAIL,
            to: notifierOptions.sendTo,
            subject: `${process.env.APP_NAME} - New Subject Registration`,
            html: compiledText('sendNoticeToAdminSignup', {
              prefix: process.env.SUBJECT_PREFIX,
              appName: process.env.APP_NAME,
              obj: obj,
              link: `${getHost()}admin/subjects/${obj.id}`,
            })
          }
          return sendEmail(email)
          break

        default:
          break
      }
    }
  }
};
