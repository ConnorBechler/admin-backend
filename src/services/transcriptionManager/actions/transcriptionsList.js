const Sequelize = require('sequelize');
const errors = require('@feathersjs/errors');

const reportOutput = async (app, { searchString, params: dataParams}, params) => {

  searchString = searchString ? searchString.replace(/'/g, "\\'") : null;

  const queryWhere = [ `transcriptions.deletedAt IS NULL`, `transcriptions.status = '99'` ];

  const sequelizeClient = app.get('sequelizeClient');
  let rawq = `
    SELECT subjects.shortcode, JSON_EXTRACT(subjects.metadata, '$.coded') AS 'subjectMetadataCoded', subjects.id AS 'subjectId', diaries.id AS 'diaryId', diaries.metadata AS 'diaryMetadata', transcriptions.*,
      (SELECT COUNT(*) FROM processingJobs WHERE processingJobs.transcriptionId = transcriptions.id AND processingJobs.status != -1 AND processingJobs.status != 999) AS 'processingJobCount'
    FROM transcriptions
    LEFT JOIN documents ON documents.id = transcriptions.documentId
    LEFT JOIN diaries ON diaries.id = documents.parentId
    LEFT JOIN profiles ON profiles.id = diaries.profileId
    LEFT JOIN subjects ON subjects.id = profiles.subjectId
    WHERE
      `;

  if (searchString) {
    queryWhere.push(`(subjects.shortcode LIKE '%${searchString}%' OR diaries.metadata->>"$.diaryDate" LIKE '%${searchString}%')`);
  }

  if (dataParams.completedOnly) {
    queryWhere.push(`diaries.metadata ->> '$.editingStatus' = "Completed"`);
  }

  if (!dataParams.includeLocked) {
    queryWhere.push(`(transcriptions.metadata->>"$.locked" != "true" OR transcriptions.metadata->>"$.locked" IS NULL)`);
  }

  if (!dataParams.includeHidden) {
    queryWhere.push(`transcriptions.hidden = 0`);
  }

  rawq += queryWhere.join(`
      AND `);

  rawq += `
    HAVING diaryId IS NOT NULL`;

  const totalTranscriptionsCount = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });

  rawq += `
    ORDER BY transcriptions.createdAt ASC
    LIMIT ${dataParams.limit}
    OFFSET ${dataParams.skip}`;

  const ret = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });

  return { serverItemsLength: totalTranscriptionsCount.length, data: ret };

};

module.exports = reportOutput;
