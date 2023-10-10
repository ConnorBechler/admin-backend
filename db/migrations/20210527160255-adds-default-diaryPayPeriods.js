'use strict';
const { diaryPayPeriods } = require('../models');
const biweeklyPayPeriods = require('../data/biweeklyPayPeriods');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      let toConvert = 0;
      for (const diaryPayPeriod of biweeklyPayPeriods) {
        toConvert += 1;
        await diaryPayPeriods.create({
          startDate: diaryPayPeriod.startDate,
          endDate: diaryPayPeriod.endDate,
          goal: diaryPayPeriod.goal,
        })
        .catch((err) => {throw err});
        if (toConvert % 500 === 0 && toConvert !== 0) {
          console.log(`processed ${toConvert} diaryPayPeriods`);
        }
      }
      console.log(`added ${toConvert} diaryPayPeriods`);
      return Promise.resolve();
    }
    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await diaryPayPeriods.destroy({where: {}, truncate: true})
      .then(() => {console.log('removed diaryPayPeriods')})
      .catch((err) => {throw err});
  }
};
