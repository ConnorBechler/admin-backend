const axios = require('axios');
const querystring = require('querystring');
const { Forbidden, BadRequest } = require('@feathersjs/errors');
const mailer = require('../../mailer/notifier');

const validateRecaptcha = async (recaptchaToken) => {
  return await axios
    .post('https://www.google.com/recaptcha/api/siteverify', 
      querystring.stringify({
        secret: process.env.RECAPTCHA_SECRET,
        response: recaptchaToken
      })
    )
    .then((resp) => {
      if (!resp.data.success) {
        throw new BadRequest('Could not validate captcha.');
      }
      return true;
    })
};

const runner = async (app, { params }) => {
  let ret = false;
  const SubjectService = app.service('subjects');

  // const valid = await validateRecaptcha(params.recaptchaToken);

  // true for now, disabling recaptcha
  if (true) {
    if (params.metadata.educationLevel && !Array.isArray(params.metadata.educationLevel)) {
      params.metadata.educationLevel = [ params.metadata.educationLevel ];
    }

    params.metadata.frequency = params.metadata.frequency ? params.metadata.frequency : "weekly";

    const subj = await SubjectService.create(params);
    ret = true;
    const sendTo = await app.service('configs').find({ query: { name: 'signupNotificationAddresses' }, paginate: false });
    if (sendTo.length) {
      mailer(app).notifier('sendNoticeToAdminSignup', subj, { sendTo: sendTo[0][sendTo[0].field] });
    }
    // mailer(app).notifier('sendNoticeToAdminSignup', subj, { sendTo: 'wernerru@msu.edu'});
  }

  return ret;
};

module.exports = runner;