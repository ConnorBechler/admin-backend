'use strict';
const { transcriptions, transcriptSentences } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Upgrading Transcript Data...');
    try {
      await transcriptions.findAll({where: { status: 99 }})
        .then(async (transcripts) => {
          console.log('found', transcripts.length, 'transcripts to upgrade');
          for (const idx in transcripts) {
            for (const tidx in transcripts[idx].content) {
              await transcriptSentences.create({
                transcriptionId: transcripts[idx].id,
                startTime: transcripts[idx].content[tidx].startTime,
                endTime: transcripts[idx].content[tidx].endTime,
                content: transcripts[idx].content[tidx].transcript,
                metadata: {
                  confidence: transcripts[idx].content[tidx].confidence,
                  wordCount: transcripts[idx].content[tidx].wordCount,
                  speaker: transcripts[idx].content[tidx].speaker,
                  header2: transcripts[idx].content[tidx].header2,
                }
              })
            }
          }
        })
        .catch((err) => {throw err});
    }
    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await transcriptSentences.destroy({where: {}, force: true});
    console.log('removed converted data');
  }
};
