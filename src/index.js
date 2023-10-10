/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');
const port = process.env.PORT;
const server = app.listen(port);
const { version } = require('../package.json');

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info(`${process.env.SUBJECT_PREFIX} API v${version} started on http://%s:%d`, app.get('host'), port)
);

