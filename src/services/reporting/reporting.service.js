const errors = require('@feathersjs/errors');
const { parseAsync, Parser } = require('json2csv');
const hooks = require('./reporting.hooks');
const notifier = require('../mailer/notifier');
const { isNotAdmin } = require('../../hooks/helpers');
const DurationSummary = require('./reports/durationSummary');
const ContentSearch = require('./reports/contentSearch');
const DiaryFilterer = require('./reports/diaryFilterer');
const AllDiaries = require('./reports/allDiaries');
const AllSubjectsWithDemo = require('./reports/allSubjectsWithDemo');

const options = {
  path: '/reporting',
  notifier: async () => { },
};

// TODO: move calls inside cases to modules like authManagement
// TODO: mailer integrations in cases/modules

module.exports = function (app) {
  app.use('/reporting',
    {
      async create (data, params) {
        switch (data.action) {
          case 'reports:durationSummary':
            return await DurationSummary(app, data, params);
            break;
          case 'reports:contentSearch':
            return await ContentSearch(app, data, params);
            break;
          case 'reports:diaryFilterer':
            return await DiaryFilterer(app, data, params);
            break;
          case 'options':
            return options;
          default:
            throw new errors.BadRequest(`Action '${data.action}' is invalid.`, {
              errors: { $className: 'badParams' }
            });
        }
      },
      async find (params) {
        switch (params.query.action) {
          case 'reports:allDiaries':
            const allDiaries = await AllDiaries(app, params);
            return { data: allDiaries, filename: `${process.env.SUBJECT_PREFIX} - all diaries`};
            break;
          case 'reports:allSubjectsWithDemo':
            const allSubjectsWithDemo = await AllSubjectsWithDemo(app, params);
            return { data: allSubjectsWithDemo, filename: `${process.env.SUBJECT_PREFIX} - all subjects`};
            break;
          case 'options':
            return options;
          default:
            throw new errors.BadRequest(`Action '${params.query.action}' is invalid.`, {
              errors: { $className: 'badParams' }
            });
        }
      }
    },
    async (req, res, next) => {
      const resp = null;
      const result = res.hook.result

      if (req.method === 'GET' && result) {
        const options = {};
        options.header = true;

        try {
          parseAsync(result.data, options)
            .then((csv) => {
              res.setHeader('Content-Type', 'text/csv');
              res.setHeader('X-FileName', result.filename + '.csv');
              res.attachment(result.filename + '.csv');
              res.send(csv);
            })
            .catch((err) => { throw err });
        }
        catch (err) {
          console.log(err)
        }
      }
    }
  );
  
  const reportingService = app.service('/reporting');
  reportingService.hooks(hooks);
  
};

