const Sequelize = require('sequelize');
const errors = require('@feathersjs/errors');

const getDiariesList = async (app, { searchString, params: dataParams}, params) => {
  /* DEBUG console.log("GETTING USER DIARIES") */
  const ProfileService = app.service('profiles');
  searchString = searchString ? searchString.replace(/'/g, "\\'") : null;
  const queryWhere = [ `diaries.deletedAt IS NULL`, `diaries.active = 1`, `subjects.email LIKE '%${params.user.email}%'`];
  const querySort = dataParams.sort;
  /* console.log(params) */
  const sequelizeClient = app.get('sequelizeClient');
  let rawq = `
    SELECT diaries.*
    FROM diaries
    LEFT JOIN profiles ON profiles.id = diaries.profileId
    LEFT JOIN subjects ON subjects.id = profiles.subjectId
    WHERE
      `;

  if (searchString) {
    queryWhere.push(`(UPPER(subjects.shortcode) LIKE '%${searchString.toUpperCase()}%' OR diaries.metadata->>"$.diaryDate" LIKE '%${searchString}%' OR UPPER(subjects.metadata->>"$.participant_category") LIKE '%${searchString.toUpperCase()}%')`);
  }

  if (!dataParams.showHiddenDiaries) {
    queryWhere.push(`diaries.hidden = 0`);
  }

  rawq += queryWhere.join(`
      AND `);

  const totalDiariesCount = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });

  rawq += `
    ORDER BY ${querySort.join(`, `)}
    LIMIT ${dataParams.limit}
    OFFSET ${dataParams.skip}`;

    /* console.log(rawq) */
    const ret = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });

  for (const diary of ret) {
    diary.profile = await ProfileService.get(diary.profileId);
  }
   
  /* console.log(ret) */

  return { serverItemsLength: totalDiariesCount.length, data: ret };

};

module.exports = getDiariesList;
