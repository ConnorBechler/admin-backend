const { Forbidden, BadRequest } = require('@feathersjs/errors');
const mailer = require('../../mailer/notifier');
const TranscriberService = require('../../transcriber/transcriber.service.js');

const runner = async (app, data) => {
  let ret = false;
  const ProfileService = app.service('profiles');

  const sidProf = await ProfileService.find({ query: { metadata: { manual: true }, subjectId: data.params.subjectId }});
  console.log(sidProf);
  return { valid: (!sidProf.data.length) ? true : false, message: (sidProf.data.length) ? 'SID already in use!' : 'Ok to manually add'};

  return ret;
};

module.exports = runner;
