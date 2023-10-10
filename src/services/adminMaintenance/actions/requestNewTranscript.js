const { Forbidden, BadRequest } = require('@feathersjs/errors');
const mailer = require('../../mailer/notifier');
const TranscriberService = require('../../transcriber/transcriber.service.js');

const runner = async (app, data) => {
  let ret = false;

  TranscriberService(app, data.params.documentId)
    .then(() => { ret = true; })
    .catch(err => { ret = false });
  console.log('transcription for', data.params.documentId);

  return ret;
};

module.exports = runner
