const Sequelize = require('sequelize');
const errors = require('@feathersjs/errors');

const reportOutput = async (app, { searchString, params: dataParams}, params) => {
  if (!searchString || searchString == ' ' || searchString == '') {
    throw new errors.BadRequest(`Missing or empty search string.`, {
      errors: { $className: 'badParams' }
    });
  }

  searchString = searchString.replace(/'/g, "\\'")

  const sequelizeClient = app.get('sequelizeClient');
  let rawq = `SELECT subjects.shortcode AS 'subjectId',
      diaries.id AS 'diaryId',
      transcriptSentences.id AS 'sentenceId',
      transcriptSentences.startTime,
      transcriptSentences.endTime,
      transcriptSentences.content,
      subjects.metadata AS 'subjectMetadata'
    FROM transcriptSentences
      LEFT JOIN transcriptions ON transcriptions.id = transcriptSentences.transcriptionId
      LEFT JOIN documents ON documents.id = transcriptions.documentId
      LEFT JOIN diaries ON diaries.id = documents.parentId
      LEFT JOIN profiles ON profiles.id = diaries.profileId
      LEFT JOIN subjects ON subjects.id = profiles.subjectId
    WHERE
      match(transcriptSentences.content) against('${searchString}' IN BOOLEAN MODE)
    HAVING
      subjectId IS NOT NULL
    LIMIT ${process.env.FTS_MAX_RESULTS || 2500}`;

  const ret = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });
  return ret;

};

module.exports = reportOutput;
