const Sequelize = require('sequelize');
const { AgeFromDateString } = require('age-calculator');

const reportOutput = async (app, params) => {
  const sequelizeClient = app.get('sequelizeClient');

  let rawq = `select
      subjects.shortcode as 'subjectId',
        subjects.email,
        subjects.metadata->>'$.dateOfBirth' as 'dateOfBirth',
        subjects.metadata->>'$.coded.birthYear' as 'coded_birthYear',
        subjects.metadata->>'$.gender' as 'gender',
        subjects.metadata->>'$.coded.gender' as 'coded_gender',
        subjects.metadata->>'$.ethnicity' as 'ethnicity',
        subjects.metadata->>'$.coded.ethnicity' as 'coded_ethnicity',
        subjects.metadata->>'$.locationCurrent' as 'locationCurrent',
        subjects.metadata->>'$.locationGrowingUp' as 'locationGrowingUp',
        subjects.metadata->>'$.coded.locationRaised' as 'coded_locationRaised',
        subjects.metadata->>'$.coded.locationParents' as 'coded_locationParents',
        count(diaries.id) as 'diaryCount',
        sum(diaries.metadata->>"$.duration") / 60 as 'diaryLengthTotalMinutes',
        paymentGroups.shortName as paymentGroup
      from subjects
      left join profiles on profiles.subjectId = subjects.id
      left join diaries on diaries.profileId = profiles.id
      left join paymentGroups on paymentGroups.id = subjects.metadata->>"$.paymentGroup"
      where subjects.shortcode like '${process.env.SUBJECT_PREFIX}%'
      group by profiles.subjectId
      order by subjects.shortcode ASC
      `;

  const ret = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });

  ret.forEach(subject => {
    subject.age = subject.dateOfBirth ? new AgeFromDateString(subject.dateOfBirth).age : null;
    subject.birthYear = subject.dateOfBirth ? subject.dateOfBirth.substr(0, 4) : null;
    delete subject.dateOfBirth;
  });

  return ret;

};

module.exports = reportOutput;