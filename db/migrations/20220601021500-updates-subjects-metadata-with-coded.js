'use strict';
const { subjects } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      let toConvert = 0;

      const subjectsToConvert = await subjects.findAll();

      for (const subject of subjectsToConvert) {
        let alreadyConverted = subject && subject.metadata && subject.metadata.coded;
        if (!alreadyConverted) {
          toConvert += 1;
          const coded = {};
          coded.birthYear = subject.metadata.dateOfBirth ? subject.metadata.dateOfBirth.substr(0, 4) : null;
          coded.gender = subject.metadata.gender || null;
          coded.ethnicityNotes = subject.metadata.ethnicity || null;
          const metadata = { ...subject.metadata, coded };
          await subject.update({ metadata })
          .catch((err) => {throw err});
        }
        if (toConvert % 500 === 0) {
          console.log(`processed ${toConvert} subjects`);
        }
      }
      console.log(`updated ${toConvert} subjects' metadata`);
      return Promise.resolve();
    }
    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    let toConvert = 0;
      const subjectsToConvert = await subjects.findAll();
      for (const subject of subjectsToConvert) {
      if (subject && subject.metadata && subject.metadata.coded) {
        toConvert += 1;
        const metadata = { ...subject.metadata };
        delete metadata.coded;

        await subject.update({ metadata })
        .catch((err) => {
          console.log(`error with subject id ${subject.id}`);
          throw err;
        });
      }
    }
    console.log(`removed coded data from ${toConvert} subjects' metadata`);
  }
};
