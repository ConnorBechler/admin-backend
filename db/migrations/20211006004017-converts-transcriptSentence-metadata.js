'use strict';
const { transcriptSentences } = require('../models');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Upgrading Transcript Sentence metadata...');
    try {
      let toConvert = 0;

      const transcriptSentencesToConvert = await transcriptSentences.findAll();
      for (const transcriptSentence of transcriptSentencesToConvert) {
        if (transcriptSentence.metadata.speaker === 'Speaker') {
          toConvert += 1;

          transcriptSentence.metadata = {
            ...transcriptSentence.metadata,
            speaker: 1,
            header2: 'SID',
          };
          await transcriptSentence.save()
          .catch((err) => {
            console.log(`error with transcriptSentence id ${transcriptSentence.id}`);
            throw err;
          });
        }
        if (toConvert % 500 === 0 && toConvert !== 0) {
          console.log(`processed ${toConvert} transcriptSentences`);
        }
      }
      console.log(`converted ${toConvert} transcriptSentences`);
      return Promise.resolve();
    }
    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transcriptSentencesToConvert = await transcriptSentences.findAll();
    let toConvert = 0;
    for (const transcriptSentence of transcriptSentencesToConvert) {
      if (transcriptSentence.metadata.speaker !== 'Speaker') {
        toConvert += 1;
        transcriptSentence.metadata = {
          ...transcriptSentence.metadata,
          speaker: 'Speaker',
          header2: 'NA',
        };
        await transcriptSentence.save();
      }
      if (toConvert % 500 === 0 && toConvert !== 0) {
        console.log(`rolled back ${toConvert} transcriptSentences`);
      }
    }
  }
};
