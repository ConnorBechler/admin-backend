const Sequelize = require('sequelize');
const { textgrid } = require('../../converter/converter.service.js');


const processingOutput = async (app, params) => {
  const sequelizeClient = app.get('sequelizeClient');
  const ProcessingJobService = app.service('processingJobs');

  let rawq = `select t.*
    from transcriptions as t
    left join processingJobs as pj on (pj.transcriptionId = t.id and (pj.status != -1 or (pj.status = -1 and pj.metadata->>"$.fixed" = "false")) and pj.deletedAt is null)
    where t.metadata->>"$.locked" = "true"
      and (t.metadata->>"$.processed" = "false" or t.metadata->>"$.processed" is null)
      and pj.transcriptionId is null
    order by t.updatedAt ASC
    limit 1`;

  const [transcription] = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });

  if (transcription && transcription.id) {
    // create initial job entry for this transcription run
    const { id: processingJobId, diaryData, shortcode } = await ProcessingJobService.create({
      remoteWorkerId: params.remoteWorker.id,
      transcriptionId: transcription.id,
      status: 0,
    });

    return {
      processingJobId,
      transcriptionId: transcription.id,
      audioId: transcription.documentId,
      fileData: {
        shortcode,
        diaryDate: diaryData.diaryDate,
        sequence: diaryData.sequence.toString().padStart(2, 0),
        revision: transcription.revision,
      },
      urls: {
        audio: `${process.env.APP_BASE}api/audio/${transcription.documentId}?remoteWorkerKey=${params.remoteWorkerKey}`,
        dictionary: `${process.env.APP_BASE}api/dictionary/download?remoteWorkerKey=${params.remoteWorkerKey}`,
        speaker: `${process.env.APP_BASE}api/transcriptions/${transcription.id}/speaker?remoteWorkerKey=${params.remoteWorkerKey}`,
        textgrid: `${process.env.APP_BASE}api/transcriptions/${transcription.id}/textgrid?remoteWorkerKey=${params.remoteWorkerKey}`,
      },
    };
  } else {
    // nothing to do, return empty
    return {};
  }

};

module.exports = processingOutput;
