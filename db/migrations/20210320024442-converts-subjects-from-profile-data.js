'use strict';
const { profiles, subjects } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      let toConvert = 0;

      const profilesToConvert = await profiles.findAll({where: { hidden: 0, subjectId: { [Op.like]: `${process.env.SUBJECT_PREFIX}-%`} } });

      for (const profile of profilesToConvert) {
        let convertedSubjectId = profile.subjectId.split('-');
        convertedSubjectId[1] = `00${convertedSubjectId[1]}`;
        convertedSubjectId = convertedSubjectId.join('-');
        let alreadyConverted = await subjects.findOne({where: { shortcode: convertedSubjectId }});
        if (!alreadyConverted) {
          const metadata = { converted: true, processingStatus: 'confirmed', ...profile.metadata };
          delete metadata.manual;
          toConvert += 1;

          const subject = await subjects.create({
            first: profile.fname,
            last: profile.lname,
            email: profile.email,
            shortcode: convertedSubjectId,
            metadata,
          })
          .catch((err) => {throw err});

          profile.subjectId = subject.id;
          profile.metadata = { ...profile.metadata, converted: true };
          await profile.save()
          .catch((err) => {throw err});
        } else {
          profile.subjectId = alreadyConverted.id;
          profile.metadata = { ...profile.metadata, converted: true };
          await profile.save()
          .catch((err) => {throw err});
        }
        if (toConvert % 500 === 0) {
          console.log(`processed ${toConvert} legacy subjects`);
        }
      }
      console.log(`converted ${toConvert} legacy subjects from profile data`);
      return Promise.resolve();
    }
    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await subjects.destroy({where: { metadata: { converted: true } }, force: true})
      .then(() => {console.log('removed converted subjects')})
      .catch((err) => {throw err});
  }
};
