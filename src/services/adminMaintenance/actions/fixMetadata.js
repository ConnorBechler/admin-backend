const { Forbidden, BadRequest } = require('@feathersjs/errors');
const mailer = require('../../mailer/notifier');
const ConverterService = require('../../converter/converter.service.js');

const runner = async (app, data) => {
  let ret = false;
  const DocumentService = app.service('documents');

  const documents = await DocumentService.find({ query: data.params.query });
  if (documents.data.length) {
    ConverterService.getMetadata(app, documents.data[0].id, 'diaries')
      .then(() => { ret = true; })
      .catch(err => { console.log('ffmpeg error:', err); ret = false; });
    console.log('metadata gen for', documents.data[0].id);
  }

  return ret;
};

module.exports = runner;
