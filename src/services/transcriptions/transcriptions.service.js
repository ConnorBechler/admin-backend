// Initializes the `transcriptions` service on path `/transcriptions`
const { parseAsync, Parser } = require('json2csv');
const { mkdir, rm, unlink, writeFile } = require('fs').promises;
const ziplib = require('zip-lib');
const { v4: uuidv4 } = require('uuid');
const { Transcriptions } = require('./transcriptions.class');
const createModel = require('../../models/transcriptions.model');
const hooks = require('./transcriptions.hooks');
const { text, textgrid, speaker } = require('../converter/converter.service.js');
const { BadRequest } = require('@feathersjs/errors');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/transcriptions', new Transcriptions(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('transcriptions');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants')
    ];
  });

  app.use('/transcriptions/batchDownload/:type',
    {
      setup(app) {
        this.app = app;
      },
      async find(params) {
        const { type } = params.route;
        const options = params.query;
        const destination = this.app.get('uploads');
        const tempFolderId = uuidv4();
        await mkdir(`${destination}/${tempFolderId}`);
        options.header = (options.header != "false");
        options.redact = (options.redact != "false");
        options.raw = (options.raw != "false");
        const transcriptions = await this.app.service('transcriptions').find({ query: { status: 99, $limit: 999999, $sort: {documentId: 1} }});
        console.log(`starting ${tempFolderId} conversion to ${type} with ${transcriptions.data.length} items`)
        for (transcription of transcriptions.data) {
          try {
            const doc = await this.app.service('documents').get(transcription.documentId);
            const diary = await this.app.service('diaries').get(doc.parentId);
            const sid = diary.profile.subject ? diary.profile.subject.shortcode : 'NOSID';
            if (sid.split('-')[0] !== `${process.env.SUBJECT_PREFIX}`) {
              throw `not a valid ${process.env.SUBJECT_PREFIX} sid, skipping`;
            }
            const { data: sentences } = await this.app.service('transcriptSentences').find({ query: { transcriptionId: transcription.id }});
            const tsSentences = sentences.map((s) => {
              s.startTime = (parseFloat(s.startTime) + parseFloat('0.01')).toFixed(2);
              s.endTime = parseFloat(s.endTime).toFixed(2);
              s.metadata.header2 = s.metadata.speaker === 1 ? (options.raw ? 'Speaker' : sid) : 'Other';
              s.content = s.metadata.redact && options.redact ? '[REDACTED]' : s.content;
              return s;
            })
            let filename = options.raw ? transcription.documentId : (sid + '_' + (diary.metadata.diaryDate || new Date(new Date(diary.createdAt).getTime() - new Date(diary.createdAt).getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10)) + '_' + (diary.metadata.sequence.toString().padStart(2, 0) || '00') + '_rev' + transcription.revision + (options.redact ? '-redacted' : ''));
            filename = transcription.edited ? `${filename}-corrected` : filename;
            await parseAsync(tsSentences, options)
              .then(async (ret) => {
                try {
                  await writeFile(`${destination}/${tempFolderId}/${filename}.${type === 'tsv' ? 'txt' : 'csv'}`, ret, () => {});
                } catch (err) { throw err }
              })
          } catch (err) { console.log('err', err) };
        }
        return { destination, tempFolderId, type, redacted: options.redact };
      },
    },
    async (req, res, next) => {
      const { destination, tempFolderId, type, redacted } = res.data;
      const curDate = new Date().toISOString().substring(0,10);
      const zip = new ziplib.Zip();
      await zip.addFolder(`${destination}/${tempFolderId}`, `${process.env.SUBJECT_PREFIX} transcripts - ${redacted ? 'redacted ' : ''}${type} ${curDate}.zip`);
      try {
        await zip.archive(`${destination}/${tempFolderId}.zip`)
          .then((ret) => {
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('X-FileName', `${process.env.SUBJECT_PREFIX} transcripts - ${redacted ? 'redacted ' : ''}${type} ${curDate}.zip`)
            res.sendFile(`${destination}/${tempFolderId}.zip`);
            console.log(`sent zip for ${tempFolderId}`);
          })
      } catch (err) {
        console.log('end error:', err);
        res.send(null);
      }
      try {
        console.log(`cleaning up ${tempFolderId}`);
        await rm(`${destination}/${tempFolderId}`, { recursive: true });
        await unlink(`${destination}/${tempFolderId}.zip`);
      } catch (err) {
        console.log(`clean up ${tempFolderId} error:`, err);
      }
    }
  );

  app.use('/transcriptions/:transcriptionId/:type',
    {
      setup(app) {
        this.app = app;
      },
      async find(params) {
        const { transcriptionId } = params.route;
        const transcription = await this.app.service('transcriptions').get(transcriptionId);
        return transcription;
      },
    },
    async (req, res, next) => {
      if (!req.params && !req.params.type) {
        throw new BadRequest(`Error: type is a required key`);
      }
      switch (req.params.type) {
        case 'textgrid':
          textgrid(req, res, next);
          break;
        case 'tsv':
          text(req, res, next);
          break;
        case 'csv':
          text(req, res, next);
          break;
        case 'speaker':
          speaker(req, res, next);
          break;
        // Add more cases as needed for other types
        default:
          throw new BadRequest(`Error: invalid type '${req.params.type}'`);
          break;
      }
    }
  );

  const transcriptDownloadService = app.service('/transcriptions/:transcriptionId/:type');

  transcriptDownloadService.hooks(hooks);

};
