const Sequelize = require('sequelize');
const { AgeFromDateString } = require('age-calculator');

const reportOutput = async (app, params) => {
  const sequelizeClient = app.get('sequelizeClient');

  let rawq = `select
      subjects.shortcode as 'subjectId',
        subjects.metadata->>'$.dateOfBirth' as 'dateOfBirth',
        subjects.metadata->>'$.gender' as 'gender',
        subjects.metadata->>'$.ethnicity' as 'ethnicity',
        subjects.metadata->>'$.locationCurrent' as 'locationCurrent',
        subjects.metadata->>'$.locationGrowingUp' as 'locationGrowingUp'
      from subjects
      where subjects.shortcode like '${process.env.SUBJECT_PREFIX}%'
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