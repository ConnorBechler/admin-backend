'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.describeTable('transcriptSentences')
        .then(async (attributes) => {
          if (attributes.startTime) {
            await queryInterface.changeColumn('transcriptSentences', 'startTime', {
              type: DataTypes.DECIMAL(7,2),
            }).then(() => {console.log('updated startTime field to 7,2');});
          }
          if (attributes.startTime) {
            await queryInterface.changeColumn('transcriptSentences', 'endTime', {
              type: DataTypes.DECIMAL(7,2),
            }).then(() => {console.log('updated endTime field to 7,2');});
          }

          return Promise.resolve();
        })
        .catch((err) => {throw err});


    }

    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    return await queryInterface.describeTable('transcriptSentences')
      .then(async (attributes) => {
          if (attributes.startTime) {
            await queryInterface.changeColumn('transcriptSentences', 'startTime', {
              type: DataTypes.DECIMAL(7,1),
            }).then(() => {console.log('reset startTime field to 7,1');});
          }
          if (attributes.startTime) {
            await queryInterface.changeColumn('transcriptSentences', 'endTime', {
              type: DataTypes.DECIMAL(7,1),
            }).then(() => {console.log('reset endTime field to 7,1');});
          }

      })
  }
};
