const Sequelize = require('sequelize');

const reportOutput = async (app, params) => {
  const sequelizeClient = app.get('sequelizeClient');

  /*
  let rawq = `select
      profiles.subjectId,
      diaries.metadata->>"$.diaryDate" as 'diaryDate',
      round(sum(diaries.metadata->>"$.duration") / 60, 1) as 'diaryDuration',
      profiles.metadata->>"$.age_category" as 'ageCategory'
    from diaries
    left join profiles on profiles.id = diaries.profileId
    where profiles.metadata->>"$.age_category" != 'Test'
    group by profiles.subjectId, diaries.metadata->>"$.diaryDate", profiles.metadata->>"$.age_category"
    order by diaries.metadata->>"$.diaryDate" DESC`;
  */

  let rawq = `select
      subjects.shortcode as 'subjectId',
      diaries.metadata->>"$.diaryDate" as 'diaryDate',
      round(diaries.metadata->>"$.duration" / 60, 1) as 'diaryDuration',
      diaries.metadata->>"$.sequence" as 'sequence',
      subjects.metadata->>"$.age_category" as 'ageCategory'
    from diaries
    left join profiles on profiles.id = diaries.profileId
    left join subjects on subjects.id = profiles.subjectId
    where subjects.metadata->>"$.age_category" != 'Test'
    group by profiles.subjectId, diaries.metadata->>"$.diaryDate", diaries.metadata->>"$.sequence", subjects.metadata->>"$.age_category"
    order by diaries.metadata->>"$.diaryDate" DESC, subjects.shortcode ASC, diaries.metadata->>"$.sequence" ASC`;

  const ret = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });

  return ret;

};

module.exports = reportOutput;