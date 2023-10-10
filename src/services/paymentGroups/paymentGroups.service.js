// Initializes the `paymentGroups` service on path `/paymentGroups`
const { PaymentGroups } = require('./paymentGroups.class');
const createModel = require('../../models/paymentGroups.model');
const hooks = require('./paymentGroups.hooks');

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
  app.use('/paymentGroups', new PaymentGroups(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('paymentGroups');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants')
    ];
  })

};
