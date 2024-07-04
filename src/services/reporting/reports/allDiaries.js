const Sequelize = require('sequelize');

const reportOutput = async (app, params) => {
  const sequelizeClient = app.get('sequelizeClient');

  let rawq = `select
      subjects.shortcode as 'subjectId',
      diaries.metadata->>"$.diaryDate" as 'diaryDate',
      round(diaries.metadata->>"$.duration" / 60, 1) as 'diaryDuration',
      diaries.metadata->>"$.sequence" as 'sequence',
      subjects.metadata->>"$.participant_category" as 'participantCategory'
    from diaries
    left join profiles on profiles.id = diaries.profileId
    left join subjects on subjects.id = profiles.subjectId
    where subjects.metadata->>"$.participant_category" != 'Test'
    group by profiles.subjectId, diaries.metadata->>"$.diaryDate", diaries.metadata->>"$.sequence", subjects.metadata->>"$.participant_category"
    order by diaries.metadata->>"$.diaryDate" DESC, subjects.shortcode ASC, diaries.metadata->>"$.sequence" ASC`;

  const ret = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });

  return ret;

};

module.exports = reportOutput;