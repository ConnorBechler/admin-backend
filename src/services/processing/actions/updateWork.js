const Sequelize = require('sequelize');
const { BadRequest, Forbidden } = require('@feathersjs/errors');

const processingOutput = async (app, params) => {
  const sequelizeClient = app.get('sequelizeClient');
  const ProcessingJobService = app.service('processingJobs');

  if (!params.processingJobId) {
    throw new BadRequest(`Error: Missing Processing Job ID in request`);
  }
  const processingJob = await ProcessingJobService.get(params.processingJobId);
  if (processingJob.metadata && processingJob.metadata.canceled) {
    // TODO: client should stop work on this one
    throw new Forbidden('Error: Processing Job canceled', {
      stopWork: true,
    });
  }
  if (processingJob.status <= -1 || processingJob.status == 999) {
    throw new Forbidden('Error: Processing Job ended', {
      stopWork: true,
    });
  }
  if (!params.stage) {
    throw new BadRequest(`Error: Missing updated stage data`);
  }
  if (!params.status && params.status !== 0) {
    throw new BadRequest(`Error: Missing updated status data`);
  }

  const newMetadata = {
      ...processingJob.metadata,
      stage: params.stage
  }
  if (params.message) {
    newMetadata.message = params.message;
  }
  if (params.status == -1) {
    newMetadata.fixed = false;
  }
  
  const updatedProcessingJob = await ProcessingJobService.patch(processingJob.id, {
    status: params.status,
    metadata: newMetadata

  });
  delete updatedProcessingJob.transcription;
  delete updatedProcessingJob.remoteWorker;
  delete updatedProcessingJob.diaryData;
  delete updatedProcessingJob.shortcode;
  return updatedProcessingJob;

};

module.exports = processingOutput;
