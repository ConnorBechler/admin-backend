// Initializes the `diaryPayPeriods` service on path `/diaryPayPeriods`
const { DiaryPayPeriods } = require('./diaryPayPeriods.class');
const createModel = require('../../models/diaryPayPeriods.model');
const hooks = require('./diaryPayPeriods.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate: {
      ... paginate,
      default: 9999,
    },
  };

  // Initialize our service with any options it requires
  app.use('/diaryPayPeriods', new DiaryPayPeriods(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('diaryPayPeriods');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants')
    ];
  })

};
