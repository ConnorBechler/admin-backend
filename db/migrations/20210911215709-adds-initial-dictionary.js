'use strict';
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { dictionaryWords } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      let toConvert = 0;
      const dictList = fs.createReadStream(path.resolve(__dirname, '../data/dict.txt'));
      const dictReader = readline.createInterface({
        input: dictList,
        crlfDelay: Infinity
      });

      for await (const dictLine of dictReader) {
        const dictionaryWord = dictLine.trim().split('  ');
        if (dictionaryWord.length && dictionaryWord.length == 2) {
          toConvert += 1;
          await dictionaryWords.create({
            word: dictionaryWord[0],
            phonemes: dictionaryWord[1],
            metadata: {
              source: 'core',
            }
          })
          .catch((err) => {throw err});
        }
        if (toConvert % 1000 === 0 && toConvert !== 0) {
          console.log(`processed ${toConvert} dictionaryWords`);
        }
      }
      console.log(`added ${toConvert} dictionaryWords`);
      return Promise.resolve();
    }
    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await dictionaryWords.destroy({where: {}, truncate: true})
      .then(() => {console.log('removed dictionaryWords')})
      .catch((err) => {throw err});
  }
};
